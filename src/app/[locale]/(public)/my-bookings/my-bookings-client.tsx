"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/safe-image";
import { getSafeImageGallery } from "@/lib/image";
import { CalendarRange, CreditCard, Hotel, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatLocalDateRange,
  formatLongDate,
} from "@/lib/formatters";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  CONFIRMED: "bg-green-500/10 text-green-700 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-700 border-blue-500/20",
};

const paymentStatusColors: Record<string, string> = {
  UNPAID: "bg-red-500/10 text-red-700 border-red-500/20",
  PAID: "bg-green-500/10 text-green-700 border-green-500/20",
  REFUNDED: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  villa: { name: string; imageUrls: string[] } | null;
  payment: { status: string; paymentMethod: string } | null;
}

export function MyBookingsClient({ bookings }: { bookings: Booking[] }) {
  const t = useTranslations("booking");
  const locale = useLocale();

  if (bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="mx-auto max-w-2xl rounded-[2rem] border-border/70 bg-card/90 shadow-[0_24px_70px_-40px_rgba(45,35,24,0.35)]">
          <CardContent className="px-8 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Hotel className="h-8 w-8" />
            </div>
            <h2 className="font-display mt-6 text-4xl tracking-[0.03em]">{t("emptyTitle")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              {t("emptyDescription")}
            </p>
            <Button asChild className="mt-8 rounded-full px-8">
              <Link href="/villas">{t("browseMoreVillas")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="space-y-5">
        {bookings.map((booking) => (
          <Card
            key={booking.id}
            className="overflow-hidden rounded-[2rem] border-border/70 bg-card/90 shadow-[0_18px_56px_-34px_rgba(45,35,24,0.32)]"
          >
            <CardContent className="p-4 md:p-5">
              <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
                <div className="relative min-h-52 overflow-hidden rounded-[1.6rem] bg-muted">
                  {booking.villa?.imageUrls?.[0] ? (
                    <SafeImage
                      src={getSafeImageGallery(booking.villa.imageUrls)[0]}
                      alt={booking.villa.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 256px"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/70">
                      {t("bookingIdLabel")}
                    </p>
                    <p className="mt-2 truncate font-mono text-sm text-white/88">{booking.id}</p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col justify-between gap-5 rounded-[1.6rem] border border-border/60 bg-background/65 p-5">
                  <div className="flex flex-col gap-4 border-b border-border/70 pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="font-display text-3xl tracking-[0.03em]">
                        {booking.villa?.name || t("unknownVilla")}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatLocalDateRange(booking.checkInDate, booking.checkOutDate, locale)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusColors[booking.status] || ""}>
                        {t(`status.${booking.status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"}`)}
                      </Badge>
                      {booking.payment && (
                        <Badge variant="outline" className={paymentStatusColors[booking.payment.status] || ""}>
                          {t(`paymentStatus.${booking.payment.status as "UNPAID" | "PAID" | "REFUNDED"}`)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.2rem] border border-border/60 bg-card/90 p-4">
                      <div className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CalendarRange className="mt-0.5 h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em]">{t("checkInLabel")}</p>
                          <p className="mt-2 text-sm text-foreground">{formatLongDate(booking.checkInDate, locale)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[1.2rem] border border-border/60 bg-card/90 p-4">
                      <div className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CreditCard className="mt-0.5 h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em]">{t("summaryTotalLabel")}</p>
                          <p className="mt-2 text-sm text-foreground">{formatCurrency(booking.totalAmount, locale)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[1.2rem] border border-border/60 bg-card/90 p-4">
                      <div className="flex items-start gap-3 text-sm text-muted-foreground">
                        <ReceiptText className="mt-0.5 h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em]">{t("reservedOnLabel")}</p>
                          <p className="mt-2 text-sm text-foreground">{formatLongDate(booking.createdAt, locale)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
