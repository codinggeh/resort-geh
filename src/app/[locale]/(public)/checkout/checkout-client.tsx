"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";
import { createBooking } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Building,
  Loader2,
  CalendarRange,
  UserRound,
  ShieldCheck,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  CalendarPlus,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { SafeImage } from "@/components/safe-image";
import {
  formatCurrency,
  formatLocalDateRange,
  formatLongDate,
} from "@/lib/formatters";
import { getSafeImageGallery } from "@/lib/image";
import { isDemoReadOnlyError } from "@/lib/demo-mode-errors";
import { downloadBookingIcs } from "@/lib/booking-calendar";

interface CheckoutClientProps {
  villa: {
    id: string;
    name: string;
    pricePerNight: number;
    maxGuests: number;
    imageUrls: string[];
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
}

export function CheckoutClient({
  villa,
  checkIn,
  checkOut,
  nights,
  totalPrice,
}: CheckoutClientProps) {
  const t = useTranslations("booking");
  const tv = useTranslations("villa");
  const tc = useTranslations("common");
  const td = useTranslations("demo");
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [guestCount, setGuestCount] = useState(Math.min(2, villa.maxGuests));
  const [paymentMethod, setPaymentMethod] = useState<string>("CREDIT_CARD");
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    bookingId: string;
    paymentUrl?: string;
  } | null>(null);
  const [referenceCopied, setReferenceCopied] = useState(false);

  const paymentMethods = [
    {
      value: "CREDIT_CARD",
      label: t("creditCard"),
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      value: "BANK_TRANSFER",
      label: t("bankTransfer"),
      icon: <Building className="h-5 w-5" />,
    },
  ];

  const steps = [
    { num: 1, label: t("step1") },
    { num: 2, label: t("step2") },
    { num: 3, label: t("step3") },
    { num: 4, label: t("step4") },
  ];
  const checkoutReturnPath = `/checkout?villaId=${encodeURIComponent(villa.id)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`;
  const loginHref = `/login?next=${encodeURIComponent(checkoutReturnPath)}`;

  function mapBookingError(message?: string) {
    if (!message) {
      return t("bookingFailed");
    }

    const maxGuestsMatch = message.match(/^Max (\d+) guests allowed$/);

    if (maxGuestsMatch) {
      return t("validation.maxGuests", { count: maxGuestsMatch[1] });
    }

    const mappedMessages: Record<string, string> = {
      "Pakasir is not configured yet": t("validation.pakasirUnavailable"),
      "Villa not found": t("validation.villaNotFound"),
      "Villa is not available": t("validation.villaUnavailable"),
      "Selected dates conflict with an existing booking": t("validation.dateConflict"),
      "Check-in cannot be in the past": t("validation.pastCheckIn"),
      "Check-out must be after check-in": t("validation.invalidDateOrder"),
    };

    return mappedMessages[message] ?? message;
  }

  async function handleSubmit() {
    if (!session) {
      router.push(loginHref);
      return;
    }

    setLoading(true);
    try {
      const result = await createBooking({
        locale,
        villaId: villa.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount,
        paymentMethod: paymentMethod as "CREDIT_CARD" | "BANK_TRANSFER",
      });

      if ("error" in result && result.error) {
        if (isDemoReadOnlyError(result.error)) {
          toast.error(td("readOnlyToast"));
          return;
        }

        const errors = Object.values(result.error).flat();
        toast.error(mapBookingError(errors[0] as string | undefined));
      } else if ("success" in result && result.success) {
        const successResult = result as { success: boolean; bookingId: string; paymentUrl?: string };

        setConfirmation({
          bookingId: successResult.bookingId,
          paymentUrl: successResult.paymentUrl,
        });
        setStep(4);
        toast.success(t("bookingPending"));
      }
    } catch {
      toast.error(tc("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 pb-20 pt-8">
      <div className="mb-8 flex justify-end md:mb-10">
        {step < 4 && (
          <div className="w-full overflow-x-auto rounded-[1.6rem] border border-border/70 bg-card/90 p-4 shadow-[0_18px_56px_-34px_rgba(45,35,24,0.28)]">
            <div className="mx-auto flex min-w-max items-center justify-center gap-4">
              {steps.map((item, index) => (
                <div key={item.num} className="flex shrink-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                      step >= item.num
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/70 bg-background/80 text-muted-foreground"
                    }`}
                  >
                    {item.num}
                  </div>

                  <div className="shrink-0">
                    <p
                      className={`text-sm whitespace-nowrap ${
                        step >= item.num ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`h-px w-8 shrink-0 ${
                        step > item.num ? "bg-primary/60" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_24rem]">
        <div>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="rounded-[2rem] border-border/70 bg-card/90 shadow-[0_22px_70px_-40px_rgba(45,35,24,0.35)]">
                  <CardHeader className="border-b border-border/70 pb-6">
                    <CardTitle className="font-display text-3xl tracking-[0.03em]">
                      {t("confirmDates")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6 md:p-8">
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-[1.6rem] border border-border/60 bg-background/70 p-5 shadow-[0_14px_34px_-28px_rgba(45,35,24,0.22)]">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CalendarRange className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                              {t("checkInLabel")}
                            </p>
                            <p className="mt-3 text-lg font-medium leading-snug text-foreground">
                              {formatLongDate(checkIn, locale)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.6rem] border border-border/60 bg-background/70 p-5 shadow-[0_14px_34px_-28px_rgba(45,35,24,0.22)]">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CalendarRange className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                              {t("checkOutLabel")}
                            </p>
                            <p className="mt-3 text-lg font-medium leading-snug text-foreground">
                              {formatLongDate(checkOut, locale)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.6rem] border border-border/60 bg-background/70 p-5 shadow-[0_14px_34px_-28px_rgba(45,35,24,0.22)]">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Label className="mb-3 block text-xs uppercase tracking-[0.24em] text-muted-foreground">
                              {t("guestsLabel")}
                            </Label>
                            <Select
                              value={guestCount.toString()}
                              onValueChange={(value) => setGuestCount(Number(value))}
                            >
                              <SelectTrigger className="h-12 rounded-xl border-border/70 bg-background/90">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: villa.maxGuests }, (_, index) => index + 1).map((count) => (
                                  <SelectItem key={count} value={count.toString()}>
                                    {count} {count > 1 ? t("guestPlural") : t("guestSingular")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button className="h-12 w-full rounded-full" onClick={() => setStep(2)}>
                      {tc("continue")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="rounded-[2rem] border-border/70 bg-card/90 shadow-[0_22px_70px_-40px_rgba(45,35,24,0.35)]">
                  <CardHeader className="border-b border-border/70 pb-6">
                    <CardTitle className="font-display text-3xl tracking-[0.03em]">
                      {t("guestDetails")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6 md:p-8">
                    {session ? (
                      <div className="rounded-[1.6rem] border border-border/60 bg-background/70 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                              {t("loggedIn")}
                            </p>
                            <p className="mt-3 text-lg font-medium text-foreground">{session.user.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{session.user.email}</p>
                          </div>
                          <Badge variant="outline" className="rounded-full border-border/70 bg-background/70 px-3 py-1">
                            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                            {t("loggedIn")}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-[1.6rem] border border-dashed border-border/80 bg-background/60 px-6 py-10 text-center">
                        <p className="text-sm text-muted-foreground">{t("loginRequired")}</p>
                        <Button asChild className="mt-4 rounded-full">
                          <Link href={loginHref}>{t("loginCta")}</Link>
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button variant="outline" className="rounded-full" onClick={() => setStep(1)}>
                        {tc("back")}
                      </Button>
                      <Button
                        className="flex-1 rounded-full"
                        onClick={() => setStep(3)}
                        disabled={!session}
                      >
                        {tc("continue")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="rounded-[2rem] border-border/70 bg-card/90 shadow-[0_22px_70px_-40px_rgba(45,35,24,0.35)]">
                  <CardHeader className="border-b border-border/70 pb-6">
                    <CardTitle className="font-display text-3xl tracking-[0.03em]">
                      {t("paymentMethod")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6 md:p-8">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`flex w-full items-center gap-4 rounded-[1.4rem] border px-5 py-4 text-left transition-all ${
                          paymentMethod === method.value
                            ? "border-primary bg-primary/6 shadow-[0_14px_34px_-26px_rgba(90,60,30,0.45)]"
                            : "border-border/70 bg-background/70 hover:border-primary/40"
                        }`}
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {method.icon}
                        </div>
                        <span className="font-medium text-foreground">{method.label}</span>
                      </button>
                    ))}

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                      <Button variant="outline" className="rounded-full" onClick={() => setStep(2)}>
                        {tc("back")}
                      </Button>
                      <Button
                        className="flex-1 rounded-full"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("completeBooking")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 4 && confirmation && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-card/95 shadow-[0_24px_70px_-38px_rgba(45,35,24,0.4)]">
                  <div className="border-b border-border/70 bg-primary/8 px-6 py-8 md:px-10 md:py-10">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-primary">
                          {t("step4")}
                        </p>
                        <h2 className="font-display mt-2 text-3xl tracking-[0.03em] text-foreground">
                          {t("confirmationTitle")}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t("confirmationDescription")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="space-y-6 p-6 md:p-10">
                    <div className="rounded-[1.4rem] border border-border/60 bg-background/80 p-5">
                      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
                        {t("bookingReference")}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <code className="flex-1 break-all rounded-xl border border-border/60 bg-muted/30 px-3 py-2 font-mono text-sm text-foreground">
                          {confirmation.bookingId}
                        </code>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(confirmation.bookingId);
                              setReferenceCopied(true);
                              toast.success(t("referenceCopied"));
                              setTimeout(() => setReferenceCopied(false), 2000);
                            } catch {
                              toast.error(tc("error"));
                            }
                          }}
                        >
                          {referenceCopied ? (
                            <ClipboardCheck className="mr-1.5 h-4 w-4" />
                          ) : (
                            <Clipboard className="mr-1.5 h-4 w-4" />
                          )}
                          {referenceCopied ? t("referenceCopiedShort") : t("copyReference")}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.4rem] border border-border/60 bg-background/70 p-5">
                        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
                          {t("summaryTitle")}
                        </p>
                        <p className="mt-3 font-display text-xl tracking-[0.03em] text-foreground">
                          {villa.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatLocalDateRange(checkIn, checkOut, locale)}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {guestCount} {guestCount > 1 ? t("guestPlural") : t("guestSingular")}
                        </p>
                      </div>

                      <div className="rounded-[1.4rem] border border-border/60 bg-background/70 p-5">
                        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
                          {t("summaryTotalLabel")}
                        </p>
                        <p className="mt-3 font-display text-3xl tracking-[0.03em] text-foreground">
                          {formatCurrency(totalPrice, locale)}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {tv("nightsCalculation", {
                            nights,
                            price: formatCurrency(villa.pricePerNight, locale),
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-dashed border-amber-500/40 bg-amber-500/5 px-5 py-4 text-sm text-amber-900 dark:text-amber-100">
                      {t("confirmationNote")}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      {confirmation.paymentUrl && (
                        <Button
                          asChild
                          className="flex-1 rounded-full"
                        >
                          <a href={confirmation.paymentUrl}>{t("payNow")}</a>
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          downloadBookingIcs({
                            bookingId: confirmation.bookingId,
                            villaName: villa.name,
                            checkIn,
                            checkOut,
                            guestCount,
                            siteUrl:
                              typeof window !== "undefined"
                                ? `${window.location.origin}/my-bookings`
                                : undefined,
                          });
                          toast.success(t("calendarDownloaded"));
                        }}
                      >
                        <CalendarPlus className="mr-1.5 h-4 w-4" />
                        {t("addToCalendar")}
                      </Button>
                      <Button asChild variant="outline" className="rounded-full">
                        <Link href="/my-bookings">{t("viewMyBookings")}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <aside>
          <Card className="sticky top-28 overflow-hidden rounded-[2rem] border-border/70 bg-card/95 shadow-[0_24px_80px_-36px_rgba(45,35,24,0.45)]">
            <div className="relative h-56">
              <SafeImage
                src={getSafeImageGallery(villa.imageUrls)[0]}
                alt={villa.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 384px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/70">
                  {t("summaryTitle")}
                </p>
                <h3 className="font-display mt-2 text-3xl tracking-[0.03em] text-white">
                  {villa.name}
                </h3>
              </div>
            </div>

            <CardContent className="space-y-5 p-6">
              <div className="rounded-[1.4rem] border border-border/60 bg-background/70 p-4">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CalendarRange className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em]">{t("confirmDates")}</p>
                    <p className="mt-2 text-sm text-foreground">
                      {formatLocalDateRange(checkIn, checkOut, locale)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-border/60 bg-background/70 p-4">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <UserRound className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em]">{t("guestsLabel")}</p>
                    <p className="mt-2 text-sm text-foreground">
                      {guestCount} {guestCount > 1 ? t("guestPlural") : t("guestSingular")}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <span>
                    {tv("nightsCalculation", {
                      nights,
                      price: formatCurrency(villa.pricePerNight, locale),
                    })}
                  </span>
                  <span className="text-foreground">{formatCurrency(totalPrice, locale)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{t("summaryTotalLabel")}</span>
                <span className="font-display text-3xl tracking-[0.03em] text-foreground">
                  {formatCurrency(totalPrice, locale)}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
