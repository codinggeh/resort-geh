"use server";

import { db } from "@/db";
import { bookings, payments, villas } from "@/db/schema";
import { getAuthSession } from "@/lib/session";
import { bookingSchema } from "@/lib/validations";
import { eq, and, lt, gt, ne, gte, or } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { revalidateLocalizedPaths } from "@/lib/revalidate";
import {
  buildPakasirRedirectUrl,
  fetchPakasirTransactionDetail,
  getPakasirConfig,
} from "@/lib/pakasir";

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

function mapProviderMethod(providerMethod?: string) {
  if (!providerMethod) {
    return "BANK_TRANSFER" as const;
  }

  if (providerMethod === "qris") {
    return "CREDIT_CARD" as const;
  }

  return "BANK_TRANSFER" as const;
}

export async function createBooking(formData: {
  locale: string;
  villaId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  paymentMethod: "CREDIT_CARD" | "BANK_TRANSFER";
}) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  // Validate input
  const parsed = bookingSchema.safeParse({
    villaId: formData.villaId,
    checkInDate: formData.checkInDate,
    checkOutDate: formData.checkOutDate,
    guestCount: formData.guestCount,
    paymentMethod: formData.paymentMethod,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { villaId, checkInDate, checkOutDate, guestCount, paymentMethod } = parsed.data;
  const today = getSiteDateString();

  if (checkInDate < today) {
    return {
      error: {
        checkInDate: ["Check-in cannot be in the past"],
      },
    };
  }

  if (!getPakasirConfig()) {
    return {
      error: {
        paymentMethod: ["Pakasir is not configured yet"],
      },
    };
  }

  const pendingHoldCutoff = getPendingHoldCutoff();

  // Calculate total
  const nights = Math.ceil(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) {
    return {
      error: {
        checkOutDate: ["Check-out must be after check-in"],
      },
    };
  }

  const bookingId = uuid();
  const paymentId = uuid();
  const transactionResult = db.transaction(
    (tx) => {
      const villa = tx
        .select({
          id: villas.id,
          slug: villas.slug,
          pricePerNight: villas.pricePerNight,
          maxGuests: villas.maxGuests,
          status: villas.status,
        })
        .from(villas)
        .where(eq(villas.id, villaId))
        .get();

      if (!villa) {
        return { error: { villaId: ["Villa not found"] } };
      }

      if (villa.status !== "AVAILABLE") {
        return { error: { villaId: ["Villa is not available"] } };
      }

      if (guestCount > villa.maxGuests) {
        return { error: { guestCount: [`Max ${villa.maxGuests} guests allowed`] } };
      }

      const totalAmount = nights * villa.pricePerNight;

      const overlapping = tx
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          and(
            eq(bookings.villaId, villaId),
            ne(bookings.status, "CANCELLED"),
            or(ne(bookings.status, "PENDING"), gte(bookings.createdAt, pendingHoldCutoff)),
            lt(bookings.checkInDate, checkOutDate),
            gt(bookings.checkOutDate, checkInDate)
          )
        )
        .get();

      if (overlapping) {
        return {
          error: {
            checkInDate: ["Selected dates conflict with an existing booking"],
          },
        };
      }

      const resolvedPaymentUrl = buildPakasirRedirectUrl({
        orderId: bookingId,
        amount: totalAmount,
        locale: formData.locale,
        qrisOnly: paymentMethod === "CREDIT_CARD",
      });

      if (!resolvedPaymentUrl) {
        return {
          error: {
            paymentMethod: ["Pakasir is not configured yet"],
          },
        };
      }

      tx.insert(bookings)
        .values({
          id: bookingId,
          villaId,
          guestId: session.user.id,
          checkInDate,
          checkOutDate,
          guestCount,
          totalAmount,
          status: "PENDING",
        })
        .run();

      tx.insert(payments)
        .values({
          id: paymentId,
          bookingId,
          amount: totalAmount,
          paymentMethod,
          transactionId: bookingId,
          status: "UNPAID",
          processedAt: null,
        })
        .run();

      return { success: true as const, paymentUrl: resolvedPaymentUrl, villaSlug: villa.slug };
    },
    { behavior: "immediate" }
  );

  if ("error" in transactionResult && transactionResult.error) {
    return transactionResult;
  }

  revalidateLocalizedPaths([
    "/",
    "/villas",
    `/villas/${transactionResult.villaSlug}`,
    "/my-bookings",
    "/admin",
    "/admin/bookings",
  ]);

  return { success: true, bookingId, paymentUrl: transactionResult.paymentUrl };
}

export async function getBookedDates(villaId: string) {
  const pendingHoldCutoff = getPendingHoldCutoff();
  const result = await db.query.bookings.findMany({
    where: and(
      eq(bookings.villaId, villaId),
      ne(bookings.status, "CANCELLED"),
      or(ne(bookings.status, "PENDING"), gte(bookings.createdAt, pendingHoldCutoff))
    ),
    columns: {
      checkInDate: true,
      checkOutDate: true,
    },
  });

  return result;
}

export async function getUserBookings() {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const result = await db.query.bookings.findMany({
    where: eq(bookings.guestId, session.user.id),
    with: {
      villa: true,
      payment: true,
    },
    orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
  });

  const pendingBookings = result.filter(
    (booking) => booking.status === "PENDING" && booking.payment?.status === "UNPAID"
  );

  let didSync = false;

  for (const booking of pendingBookings) {
    try {
      const detail = await fetchPakasirTransactionDetail({
        amount: booking.totalAmount,
        orderId: booking.id,
      });

      if (detail.transaction?.status !== "completed") {
        continue;
      }

      db.transaction((tx) => {
        tx.update(payments)
          .set({
            status: "PAID",
            processedAt:
              detail.transaction?.completed_at || new Date().toISOString(),
            paymentMethod: mapProviderMethod(detail.transaction?.payment_method),
            transactionId: booking.id,
          })
          .where(and(eq(payments.bookingId, booking.id), eq(payments.status, "UNPAID")))
          .run();

        tx.update(bookings)
          .set({ status: "CONFIRMED" })
          .where(and(eq(bookings.id, booking.id), eq(bookings.status, "PENDING")))
          .run();
      });

      didSync = true;
    } catch {
      // Ignore reconciliation failures; webhook or later visits can retry safely.
    }
  }

  if (!didSync) {
    return result;
  }

  revalidateLocalizedPaths([
    "/my-bookings",
    "/admin",
    "/admin/bookings",
    ...result.flatMap((booking) => (booking.villa?.slug ? [`/villas/${booking.villa.slug}`] : [])),
  ]);

  return db.query.bookings.findMany({
    where: eq(bookings.guestId, session.user.id),
    with: {
      villa: true,
      payment: true,
    },
    orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
  });
}
