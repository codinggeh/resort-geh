"use server";

import { db } from "@/db";
import { bookings, payments, reviews, users, villas } from "@/db/schema";
import {
  buildAvailableRevenueYears,
  buildRevenueChartData,
  getMonthDateRange,
  normalizeAnalyticsPeriod,
} from "@/lib/admin-analytics";
import { getAuthSession } from "@/lib/session";
import { villaSchema } from "@/lib/validations";
import { eq, and, gte, lte, sql, count } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { revalidateLocalizedPaths } from "@/lib/revalidate";
import { isDemoModeEnabled } from "@/lib/demo-mode";

const SITE_TIME_ZONE = "Asia/Jakarta";
const BOOKING_HOLD_MINUTES = 30;
const DEMO_FIELD_ERROR = { _form: ["DEMO_MODE_READ_ONLY"] } as const;
const DEMO_MESSAGE_ERROR = "DEMO_MODE_READ_ONLY";

function getSiteDateString() {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function getPendingHoldCutoff() {
  return new Date(Date.now() - BOOKING_HOLD_MINUTES * 60 * 1000).toISOString();
}

function buildVillaRevalidatePaths(slugs: Array<string | null | undefined> = []) {
  return [
    "/",
    "/villas",
    "/admin/villas",
    ...slugs.filter(Boolean).map((slug) => `/villas/${slug}`),
  ];
}

function buildBookingRevalidatePaths(slug?: string | null) {
  return [
    "/",
    "/villas",
    ...(slug ? [`/villas/${slug}`] : []),
    "/my-bookings",
    "/admin",
    "/admin/bookings",
  ];
}

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

async function requireSuperAdmin() {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

async function requireAdminWriteAccess() {
  const session = await requireAdmin();

  if (isDemoModeEnabled()) {
    return { session, demoBlocked: true as const };
  }

  return { session, demoBlocked: false as const };
}

async function requireSuperAdminWriteAccess() {
  const session = await requireSuperAdmin();

  if (isDemoModeEnabled()) {
    return { session, demoBlocked: true as const };
  }

  return { session, demoBlocked: false as const };
}

export async function createVilla(formData: {
  name: string;
  slug: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  imageUrls: string[];
  status: "AVAILABLE" | "MAINTENANCE" | "HIDDEN";
}) {
  const { demoBlocked } = await requireAdminWriteAccess();
  if (demoBlocked) return { error: DEMO_FIELD_ERROR };

  const parsed = villaSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.query.villas.findFirst({
    where: eq(villas.slug, parsed.data.slug),
  });
  if (existing) return { error: { slug: ["Slug already in use"] } };

  await db.insert(villas).values({
    id: uuid(),
    ...parsed.data,
  });

  revalidateLocalizedPaths(buildVillaRevalidatePaths([parsed.data.slug]));
  return { success: true };
}

export async function updateVilla(
  villaId: string,
  formData: {
    name: string;
    slug: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    imageUrls: string[];
    status: "AVAILABLE" | "MAINTENANCE" | "HIDDEN";
  }
) {
  const { demoBlocked } = await requireAdminWriteAccess();
  if (demoBlocked) return { error: DEMO_FIELD_ERROR };

  const currentVilla = await db.query.villas.findFirst({
    where: eq(villas.id, villaId),
    columns: {
      slug: true,
    },
  });

  if (!currentVilla) {
    return { error: { name: ["Villa not found"] } };
  }

  const parsed = villaSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.query.villas.findFirst({
    where: eq(villas.slug, parsed.data.slug),
  });

  if (existing && existing.id !== villaId) {
    return { error: { slug: ["Slug already in use"] } };
  }

  await db.update(villas).set(parsed.data).where(eq(villas.id, villaId));

  revalidateLocalizedPaths(
    buildVillaRevalidatePaths([currentVilla.slug, parsed.data.slug])
  );
  return { success: true };
}

export async function deleteVilla(villaId: string) {
  const { demoBlocked } = await requireSuperAdminWriteAccess();
  if (demoBlocked) return { error: DEMO_MESSAGE_ERROR };

  const villa = await db.query.villas.findFirst({
    where: eq(villas.id, villaId),
    columns: {
      id: true,
      slug: true,
    },
  });

  if (!villa) {
    return { error: "Villa not found" };
  }

  const [existingBooking, existingReview] = await Promise.all([
    db.query.bookings.findFirst({
      where: eq(bookings.villaId, villaId),
      columns: { id: true },
    }),
    db.query.reviews.findFirst({
      where: eq(reviews.villaId, villaId),
      columns: { id: true },
    }),
  ]);

  if (existingBooking || existingReview) {
    return { error: "Cannot delete a villa with booking or review history" };
  }

  await db.delete(villas).where(eq(villas.id, villaId));

  revalidateLocalizedPaths(buildVillaRevalidatePaths([villa.slug]));
  return { success: true };
}

export async function updateBookingStatus(
  bookingId: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
) {
  const { demoBlocked } = await requireAdminWriteAccess();
  if (demoBlocked) return { error: DEMO_MESSAGE_ERROR };

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: {
      payment: true,
      villa: {
        columns: {
          slug: true,
        },
      },
    },
  });

  if (!booking) {
    return { error: "Booking not found" };
  }

  if (booking.status === status) {
    return { success: true };
  }

  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    return { error: "This booking can no longer be changed" };
  }

  if (status === "PENDING") {
    return { error: "Bookings cannot be moved back to pending" };
  }

  if (status === "CONFIRMED" && booking.payment?.status !== "PAID") {
    return { error: "Payment must be marked as paid before confirming" };
  }

  if (status === "COMPLETED" && booking.status !== "CONFIRMED") {
    return { error: "Only confirmed bookings can be completed" };
  }

  await db.update(bookings).set({ status }).where(eq(bookings.id, bookingId));

  revalidateLocalizedPaths(buildBookingRevalidatePaths(booking.villa?.slug));
  return { success: true };
}

export async function confirmPayment(bookingId: string) {
  const { demoBlocked } = await requireAdminWriteAccess();
  if (demoBlocked) return { error: DEMO_MESSAGE_ERROR };

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: {
      payment: true,
      villa: {
        columns: {
          slug: true,
        },
      },
    },
  });

  if (!booking || !booking.payment) {
    return { error: "Payment not found for this booking" };
  }

  if (booking.status === "CANCELLED") {
    return { error: "Cancelled bookings cannot be confirmed" };
  }

  if (booking.status === "COMPLETED") {
    return { error: "Completed bookings cannot be reconfirmed" };
  }

  if (booking.payment.status === "REFUNDED") {
    return { error: "Refunded payments cannot be confirmed again" };
  }

  if (booking.payment.status === "PAID" && booking.status === "CONFIRMED") {
    return { success: true };
  }

  await db.transaction(async (tx: any) => {
    await tx.update(payments)
      .set({
        status: "PAID",
        processedAt: booking.payment?.processedAt || new Date().toISOString(),
      })
      .where(eq(payments.bookingId, bookingId));

    await tx.update(bookings)
      .set({ status: "CONFIRMED" })
      .where(eq(bookings.id, bookingId));
  });

  revalidateLocalizedPaths(buildBookingRevalidatePaths(booking.villa?.slug));
  return { success: true };
}

export async function cancelBooking(bookingId: string) {
  const { demoBlocked } = await requireAdminWriteAccess();
  if (demoBlocked) return { error: DEMO_MESSAGE_ERROR };

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: {
      payment: true,
      villa: {
        columns: {
          slug: true,
        },
      },
    },
  });

  if (!booking) {
    return { error: "Booking not found" };
  }

  if (booking.status === "COMPLETED") {
    return { error: "Completed bookings cannot be cancelled" };
  }

  if (booking.status === "CANCELLED") {
    return { success: true };
  }

  await db.transaction(async (tx: any) => {
    await tx.update(bookings)
      .set({ status: "CANCELLED" })
      .where(eq(bookings.id, bookingId));

    if (booking.payment) {
      await tx.update(payments)
        .set({
          status: booking.payment.status === "PAID" ? "REFUNDED" : booking.payment.status,
        })
        .where(eq(payments.bookingId, bookingId));
    }
  });

  revalidateLocalizedPaths(buildBookingRevalidatePaths(booking.villa?.slug));
  return { success: true };
}

export async function promoteUserToAdmin(userId: string) {
  const { demoBlocked } = await requireSuperAdminWriteAccess();
  if (demoBlocked) return { error: DEMO_MESSAGE_ERROR };

  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      role: true,
    },
  });

  if (!targetUser) {
    return { error: "User not found" };
  }

  if (targetUser.role === "SUPER_ADMIN") {
    return { error: "Super admin access cannot be changed here" };
  }

  if (targetUser.role === "ADMIN") {
    return { success: true };
  }

  await db.update(users).set({ role: "ADMIN" }).where(eq(users.id, userId));

  revalidateLocalizedPaths(["/admin/users"]);
  return { success: true };
}

export async function deleteUser(userId: string) {
  const { session, demoBlocked } = await requireSuperAdminWriteAccess();
  if (demoBlocked) return { error: DEMO_MESSAGE_ERROR };

  if (session.user.id === userId) {
    return { error: "You cannot delete your own account" };
  }

  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      role: true,
    },
  });

  if (!targetUser) {
    return { error: "User not found" };
  }

  const [existingBooking, existingReview] = await Promise.all([
    db.query.bookings.findFirst({
      where: eq(bookings.guestId, userId),
      columns: { id: true },
    }),
    db.query.reviews.findFirst({
      where: eq(reviews.guestId, userId),
      columns: { id: true },
    }),
  ]);

  if (existingBooking || existingReview) {
    return { error: "Cannot delete a user with booking or review history" };
  }

  if (targetUser.role === "SUPER_ADMIN") {
    const [superAdminCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "SUPER_ADMIN"));

    if ((superAdminCount?.count ?? 0) <= 1) {
      return { error: "Cannot delete the last super admin" };
    }
  }

  await db.delete(users).where(eq(users.id, userId));

  revalidateLocalizedPaths(["/admin/users"]);
  return { success: true };
}

export async function getAdminAnalytics(input?: { month?: number; year?: number }) {
  await requireAdmin();
  const pendingHoldCutoff = getPendingHoldCutoff();
  const today = getSiteDateString();
  const selectedPeriod = normalizeAnalyticsPeriod(input);
  const { startDate, endDate } = getMonthDateRange(selectedPeriod);

  const [revenueResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.status, "PAID"));

  const totalRevenue = revenueResult?.total ?? 0;

  const [activeResult] = await db
    .select({ count: count() })
    .from(bookings)
    .where(
      sql`${bookings.status} = 'CONFIRMED' OR (${bookings.status} = 'PENDING' AND ${bookings.createdAt} >= ${pendingHoldCutoff})`
    );

  const activeBookings = activeResult?.count ?? 0;

  const [villasResult] = await db
    .select({ count: count() })
    .from(villas)
    .where(eq(villas.status, "AVAILABLE"));

  const totalVillas = villasResult?.count ?? 0;

  const [occupiedResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${bookings.villaId})` })
    .from(bookings)
    .innerJoin(villas, eq(bookings.villaId, villas.id))
    .where(
      and(
        eq(bookings.status, "CONFIRMED"),
        eq(villas.status, "AVAILABLE"),
        lte(bookings.checkInDate, today),
        sql`${bookings.checkOutDate} > ${today}`
      )
    );

  const occupiedVillas = occupiedResult?.count ?? 0;
  const occupancyRate = totalVillas > 0 ? Math.round((occupiedVillas / totalVillas) * 100) : 0;

  const revenueByDay = await db
    .select({
      date: sql<string>`substr(${payments.processedAt}, 1, 10)`,
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(
      and(
        eq(payments.status, "PAID"),
        gte(payments.processedAt, startDate),
        lte(payments.processedAt, `${endDate}T23:59:59.999Z`)
      )
    )
    .groupBy(sql`substr(${payments.processedAt}, 1, 10)`)
    .orderBy(sql`substr(${payments.processedAt}, 1, 10)`);

  const revenueYears = await db
    .select({
      year: sql<number>`CAST(substr(${payments.processedAt}, 1, 4) AS INTEGER)`,
    })
    .from(payments)
    .where(and(eq(payments.status, "PAID"), sql`${payments.processedAt} IS NOT NULL`))
    .groupBy(sql`substr(${payments.processedAt}, 1, 4)`)
    .orderBy(sql`CAST(substr(${payments.processedAt}, 1, 4) AS INTEGER) DESC`);

  const chartData = buildRevenueChartData(selectedPeriod, revenueByDay);
  const availableYears = buildAvailableRevenueYears(
    revenueYears.map((row: { year: number }) => row.year),
    selectedPeriod.year
  );

  return {
    totalRevenue,
    activeBookings,
    totalVillas,
    occupancyRate,
    chartData,
    selectedMonth: selectedPeriod.month,
    selectedYear: selectedPeriod.year,
    availableYears,
  };
}

export async function getAllBookingsAdmin() {
  await requireAdmin();

  return db.query.bookings.findMany({
    with: {
      villa: true,
      guest: true,
      payment: true,
    },
    orderBy: (bookings: any, { desc }: any) => [desc(bookings.createdAt)],
  });
}

export async function getAllUsersAdmin() {
  await requireSuperAdmin();

  return db.query.users.findMany({
    orderBy: (users: any, { desc }: any) => [desc(users.createdAt)],
  });
}

export async function getAllVillasAdmin() {
  await requireAdmin();

  return db.query.villas.findMany({
    orderBy: (villas: any, { desc }: any) => [desc(villas.createdAt)],
  });
}

export async function searchAdmin(query: string) {
  const session = await requireAdmin();

  if (!query || query.length < 2) return { bookings: [], users: [] };

  const matchingBookings = db.query.bookings.findMany({
    where: sql`${bookings.id} LIKE ${'%' + query + '%'}`,
    with: { villa: true, guest: true },
    limit: 5,
  });

  const matchingUsers =
    session.user.role === "SUPER_ADMIN"
      ? db.query.users.findMany({
          where: sql`${users.email} LIKE ${"%" + query + "%"} OR ${users.name} LIKE ${"%" + query + "%"}`,
          limit: 5,
        })
      : Promise.resolve([]);

  return {
    bookings: await matchingBookings,
    users: await matchingUsers,
  };
}
