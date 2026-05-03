import { getAllBookingsAdmin } from "@/actions/admin";
import { getTranslations } from "next-intl/server";
import { BookingsClient } from "./bookings-client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");

  return {
    title: t("bookings"),
  };
}

export default async function AdminBookingsPage() {
  const t = await getTranslations("admin");
  const rawBookings = await getAllBookingsAdmin();

  // Serialize data for client component
  const bookings = rawBookings.map((b) => ({
    id: b.id,
    checkInDate: b.checkInDate,
    checkOutDate: b.checkOutDate,
    guestCount: b.guestCount,
    totalAmount: b.totalAmount,
    status: b.status,
    createdAt: b.createdAt,
    villa: b.villa ? { name: b.villa.name } : null,
    guest: b.guest ? { name: b.guest.name, email: b.guest.email } : null,
    payment: b.payment
      ? { status: b.payment.status, paymentMethod: b.payment.paymentMethod }
      : null,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("bookings")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("bookingsDesc")}
        </p>
      </div>

      <BookingsClient bookings={bookings} />
    </div>
  );
}
