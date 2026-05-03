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

const SITE_TIME_ZONE = "Asia/Jakarta";
const BOOKING_HOLD_MINUTES = 30;

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

// ─── Helper: Role check ───────────────────────────────────────────────────────

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

// ─── Villa CRUD ────────────────────────────────────────────────────────────────

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
  await requireAdmin();

  const parsed = villaSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.query.villas.findFirst({
    where: eq(villas.slug, parsed.data.slug),
  });
  if (existing) return { error: { slug: ["Slug already in use"] } };

  db.insert(villas)
    .values({
      id: uuid(),
      ...parsed.data,
    })
    .run();

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
  await requireAdmin();

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

  db.update(villas)
    .set(parsed.data)
    .where(eq(villas.id, villaId))
    .run();

  revalidateLocalizedPaths(
    buildVillaRevalidatePaths([currentVilla.slug, parsed.data.slug])
  );
  return { success: true };
}

export async function deleteVilla(villaId: string) {
  await requireSuperAdmin();

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

  db.delete(villas).where(eq(villas.id, villaId)).run();

  revalidateLocalizedPaths(buildVillaRevalidatePaths([villa.slug]));
  return { success: true };
}

// ─── Booking Management ────────────────────────────────────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
) {
  await requireAdmin();

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

  db.update(bookings)
    .set({ status })
    .where(eq(bookings.id, bookingId))
    .run();

  revalidateLocalizedPaths(buildBookingRevalidatePaths(booking.villa?.slug));
  return { success: true };
}

export async function confirmPayment(bookingId: string) {
  await requireAdmin();

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

  db.transaction((tx) => {
    tx.update(payments)
      .set({
        status: "PAID",
        processedAt: booking.payment?.processedAt || new Date().toISOString(),
      })
      .where(eq(payments.bookingId, bookingId))
      .run();

    tx.update(bookings)
      .set({ status: "CONFIRMED" })
      .where(eq(bookings.id, bookingId))
      .run();
  });

  revalidateLocalizedPaths(buildBookingRevalidatePaths(booking.villa?.slug));
  return { success: true };
}

export async function cancelBooking(bookingId: string) {
  await requireAdmin();

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

  db.transaction((tx) => {
    tx.update(bookings)
      .set({ status: "CANCELLED" })
      .where(eq(bookings.id, bookingId))
      .run();

    if (booking.payment) {
      tx.update(payments)
        .set({
          status: booking.payment.status === "PAID" ? "REFUNDED" : booking.payment.status,
        })
        .where(eq(payments.bookingId, bookingId))
        .run();
    }
  });

  revalidateLocalizedPaths(buildBookingRevalidatePaths(booking.villa?.slug));
  return { success: true };
}

// ─── User Management (Super Admin only) ────────────────────────────────────────

export async function promoteUserToAdmin(userId: string) {
  await requireSuperAdmin();

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

  db.update(users)
    .set({ role: "ADMIN" })
    .where(eq(users.id, userId))
    .run();

  revalidateLocalizedPaths(["/admin/users"]);
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await requireSuperAdmin();

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
    const superAdminCount = db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "SUPER_ADMIN"))
      .get();

    if ((superAdminCount?.count ?? 0) <= 1) {
      return { error: "Cannot delete the last super admin" };
    }
  }

  db.delete(users).where(eq(users.id, userId)).run();

  revalidateLocalizedPaths(["/admin/users"]);
  return { success: true };
}

// ─── Analytics (Admin) ─────────────────────────────────────────────────────────

export async function getAdminAnalytics(input?: { month?: number; year?: number }) {
  await requireAdmin();
  const pendingHoldCutoff = getPendingHoldCutoff();
  const today = getSiteDateString();
  const selectedPeriod = normalizeAnalyticsPeriod(input);
  const { startDate, endDate } = getMonthDateRange(selectedPeriod);

  // Total revenue (from paid payments)
  const revenueResult = db
    .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.status, "PAID"))
    .get();

  const totalRevenue = revenueResult?.total ?? 0;

  // Active bookings (CONFIRMED or PENDING)
  const activeResult = db
    .select({ count: count() })
    .from(bookings)
    .where(
      sql`${bookings.status} = 'CONFIRMED' OR (${bookings.status} = 'PENDING' AND ${bookings.createdAt} >= ${pendingHoldCutoff})`
    )
    .get();

  const activeBookings = activeResult?.count ?? 0;

  // Total villas
  const villasResult = db
    .select({ count: count() })
    .from(villas)
    .where(eq(villas.status, "AVAILABLE"))
    .get();

  const totalVillas = villasResult?.count ?? 0;

  // Occupancy rate (bookable villas occupied today, with checkout treated as exclusive)
  const occupiedResult = db
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
    )
    .get();

  const occupiedVillas = occupiedResult?.count ?? 0;
  const occupancyRate = totalVillas > 0 ? Math.round((occupiedVillas / totalVillas) * 100) : 0;

  // Revenue over selected month (daily breakdown)
  const revenueByDay = db
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
    .orderBy(sql`substr(${payments.processedAt}, 1, 10)`)
    .all();

  const revenueYears = db
    .select({
      year: sql<number>`CAST(substr(${payments.processedAt}, 1, 4) AS INTEGER)`,
    })
    .from(payments)
    .where(and(eq(payments.status, "PAID"), sql`${payments.processedAt} IS NOT NULL`))
    .groupBy(sql`substr(${payments.processedAt}, 1, 4)`)
    .orderBy(sql`CAST(substr(${payments.processedAt}, 1, 4) AS INTEGER) DESC`)
    .all();

  const chartData = buildRevenueChartData(selectedPeriod, revenueByDay);
  const availableYears = buildAvailableRevenueYears(
    revenueYears.map((row) => row.year),
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

// ─── Data Fetchers ─────────────────────────────────────────────────────────────

export async function getAllBookingsAdmin() {
  await requireAdmin();

  return db.query.bookings.findMany({
    with: {
      villa: true,
      guest: true,
      payment: true,
    },
    orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
  });
}

export async function getAllUsersAdmin() {
  await requireSuperAdmin();

  return db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });
}

export async function getAllVillasAdmin() {
  await requireAdmin();

  return db.query.villas.findMany({
    orderBy: (villas, { desc }) => [desc(villas.createdAt)],
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
