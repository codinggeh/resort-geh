"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { confirmPayment, cancelBooking } from "@/actions/admin";
import { AdminTablePagination } from "@/components/admin-table-pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatLocalDateRange } from "@/lib/formatters";

interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  status: string;
  createdAt: string | Date;
  villa: { name: string } | null;
  guest: { name: string; email: string } | null;
  payment: { status: string; paymentMethod: string } | null;
}

const bookingStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600",
  CONFIRMED: "bg-green-500/10 text-green-600",
  CANCELLED: "bg-red-500/10 text-red-600",
  COMPLETED: "bg-blue-500/10 text-blue-600",
};

const paymentStatusColors: Record<string, string> = {
  UNPAID: "bg-red-500/10 text-red-600",
  PAID: "bg-green-500/10 text-green-600",
  REFUNDED: "bg-orange-500/10 text-orange-600",
};

const STATUS_OPTIONS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

export function BookingsClient({ bookings }: { bookings: Booking[] }) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof STATUS_OPTIONS)[number]>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const filteredBookings = useMemo(
    () =>
      filter === "ALL"
        ? bookings
        : bookings.filter((booking) => booking.status === filter),
    [bookings, filter]
  );

  const statusFilterLabels: Record<(typeof STATUS_OPTIONS)[number], string> = {
    ALL: t("all"),
    PENDING: t("pending"),
    CONFIRMED: t("confirmed"),
    COMPLETED: t("completed"),
    CANCELLED: t("cancelled"),
  };

  const statusCounts = useMemo(
    () => ({
      ALL: bookings.length,
      PENDING: bookings.filter((booking) => booking.status === "PENDING").length,
      CONFIRMED: bookings.filter((booking) => booking.status === "CONFIRMED").length,
      COMPLETED: bookings.filter((booking) => booking.status === "COMPLETED").length,
      CANCELLED: bookings.filter((booking) => booking.status === "CANCELLED").length,
    }),
    [bookings]
  );

  const pageCount = Math.max(1, Math.ceil(filteredBookings.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filter, pageSize]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const visibleBookings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, page, pageSize]);

  async function handleConfirmPayment(bookingId: string) {
    try {
      const result = await confirmPayment(bookingId);

      if ("error" in result && result.error) {
        toast.error(t("paymentConfirmFailed"));
        return;
      }

      toast.success(t("paymentConfirmed"));
      router.refresh();
    } catch {
      toast.error(t("paymentConfirmFailed"));
    }
  }

  function openCancelDialog(bookingId: string) {
    setCancelTargetId(bookingId);
    setCancelDialogOpen(true);
  }

  async function handleCancelBooking() {
    if (!cancelTargetId) return;
    try {
      const result = await cancelBooking(cancelTargetId);

      if ("error" in result && result.error) {
        toast.error(t("cancelBookingFailed"));
        return;
      }

      toast.success(t("bookingCancelled"));
      router.refresh();
    } catch {
      toast.error(t("cancelBookingFailed"));
    } finally {
      setCancelDialogOpen(false);
      setCancelTargetId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border bg-card p-1">
          <div className="flex flex-wrap gap-1">
            {STATUS_OPTIONS.map((status) => (
              <Button
                key={status}
                type="button"
                variant={filter === status ? "default" : "ghost"}
                size="sm"
                className="rounded-lg"
                onClick={() => setFilter(status)}
              >
                <span>{statusFilterLabels[status]}</span>
                <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] leading-none text-current dark:bg-white/10">
                  {statusCounts[status]}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {filter === "ALL"
            ? t("bookingsDesc")
            : t("filteredByStatus", { status: statusFilterLabels[filter] })}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("bookingId")}</TableHead>
                <TableHead>{t("villa")}</TableHead>
                <TableHead>{t("guest")}</TableHead>
                <TableHead>{t("dates")}</TableHead>
                <TableHead>{tc("amount")}</TableHead>
                <TableHead>{tc("status")}</TableHead>
                <TableHead>{t("payment")}</TableHead>
                <TableHead className="text-right">{tc("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleBookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {t("noBookings")}
                  </TableCell>
                </TableRow>
              ) : (
                visibleBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">
                      {booking.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.villa?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{booking.guest?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.guest?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatLocalDateRange(
                        booking.checkInDate,
                        booking.checkOutDate,
                        locale
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(booking.totalAmount, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge className={bookingStatusColors[booking.status] || ""}>
                        {t(
                          booking.status.toLowerCase() as
                            | "pending"
                            | "confirmed"
                            | "cancelled"
                            | "completed"
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {booking.payment && (
                        <Badge
                          variant="outline"
                          className={paymentStatusColors[booking.payment.status] || ""}
                        >
                          {t(
                            `paymentStatus.${booking.payment.status as "UNPAID" | "PAID" | "REFUNDED"}`
                          )}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {booking.status === "PENDING" && (
                            <DropdownMenuItem onClick={() => handleConfirmPayment(booking.id)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              {t("confirmPayment")}
                            </DropdownMenuItem>
                          )}
                          {(booking.status === "PENDING" ||
                            booking.status === "CONFIRMED") && (
                            <DropdownMenuItem
                              onClick={() => openCancelDialog(booking.id)}
                              className="text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              {t("cancelBooking")}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AdminTablePagination
          page={page}
          pageSize={pageSize}
          totalItems={filteredBookings.length}
          pageCount={pageCount}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelBooking}>
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
