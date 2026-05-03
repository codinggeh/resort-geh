"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Star,
  Bed,
  Bath,
  Users,
  Wifi,
  UtensilsCrossed,
  Waves,
  Flame,
  Dumbbell,
  Car,
  Wind,
  TreePine,
  ChevronLeft,
  CalendarRange,
} from "lucide-react";
import { motion } from "framer-motion";
import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";
import { enUS, id as indonesian } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
  formatCurrency,
  formatLocalDateRange,
  formatLongDate,
} from "@/lib/formatters";
import { SafeImage } from "@/components/safe-image";
import { getSafeImageGallery } from "@/lib/image";

const amenityIcons: Record<string, ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  pool: <Waves className="h-4 w-4" />,
  kitchen: <UtensilsCrossed className="h-4 w-4" />,
  fireplace: <Flame className="h-4 w-4" />,
  gym: <Dumbbell className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  air_conditioning: <Wind className="h-4 w-4" />,
  garden: <TreePine className="h-4 w-4" />,
  infinity_pool: <Waves className="h-4 w-4" />,
};

interface VillaDetailClientProps {
  villa: {
    id: string;
    name: string;
    slug: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    imageUrls: string[];
    status: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    guestName: string;
    guestAvatar: string | null;
  }>;
  bookedDates: Array<{
    checkInDate: string;
    checkOutDate: string;
  }>;
}

export function VillaDetailClient({
  villa,
  reviews,
  bookedDates,
}: VillaDetailClientProps) {
  const t = useTranslations("villa");
  const tb = useTranslations("booking");
  const locale = useLocale();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const disabledDates = useMemo(() => {
    const dates: Date[] = [];

    for (const { checkInDate, checkOutDate } of bookedDates) {
      const checkIn = parseISO(checkInDate);
      const lastBookedNight = subDays(parseISO(checkOutDate), 1);

      if (lastBookedNight < checkIn) continue;

      dates.push(
        ...eachDayOfInterval({
          start: checkIn,
          end: lastBookedNight,
        })
      );
    }

    return dates;
  }, [bookedDates]);
  const disabledDateKeys = useMemo(
    () => new Set(disabledDates.map((date) => format(date, "yyyy-MM-dd"))),
    [disabledDates]
  );

  const nights =
    dateRange?.from && dateRange?.to
      ? Math.ceil(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const totalPrice = nights * villa.pricePerNight;
  const calendarLocale = locale === "id" ? indonesian : enUS;
  const imageGallery = getSafeImageGallery(villa.imageUrls);
  const displayImage = imageGallery[selectedImage] || imageGallery[0];
  const availableThumbs = imageGallery.slice(0, 4);
  const amenityLabels = useMemo(
    () => ({
      wifi: t("amenity.wifi"),
      pool: t("amenity.pool"),
      kitchen: t("amenity.kitchen"),
      fireplace: t("amenity.fireplace"),
      gym: t("amenity.gym"),
      parking: t("amenity.parking"),
      air_conditioning: t("amenity.air_conditioning"),
      garden: t("amenity.garden"),
      infinity_pool: t("amenity.infinity_pool"),
      beach_access: t("amenity.beach_access"),
      bbq_grill: t("amenity.bbq_grill"),
    }),
    [t]
  );

  function handleBookNow() {
    if (!dateRange?.from || !dateRange?.to) return;

    const params = new URLSearchParams({
      villaId: villa.id,
      checkIn: format(dateRange.from, "yyyy-MM-dd"),
      checkOut: format(dateRange.to, "yyyy-MM-dd"),
    });

    router.push(`/checkout?${params.toString()}`);
  }

  function handleDateRangeSelect(nextRange: DateRange | undefined) {
    if (!nextRange) {
      setDateRange(undefined);
      return;
    }

    if (nextRange.from && nextRange.to) {
      const selectedStay = eachDayOfInterval({
        start: nextRange.from,
        end: subDays(nextRange.to, 1),
      });

      const hasBlockedDate = selectedStay.some((date) =>
        disabledDateKeys.has(format(date, "yyyy-MM-dd"))
      );

      if (hasBlockedDate) {
        toast.error(tb("validation.dateConflict"));
        setDateRange({ from: nextRange.from, to: undefined });
        return;
      }
    }

    setDateRange(nextRange);
  }

  return (
    <div className="container mx-auto px-4 pb-20 pt-8">
      <Button
        variant="ghost"
        className="mb-6 rounded-full border border-border/70 bg-background/80 px-5 backdrop-blur-sm"
        onClick={() => router.back()}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        {t("backToCollection")}
      </Button>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_24rem]">
        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[2.25rem] border border-border/70 bg-card/90 shadow-[0_24px_70px_-36px_rgba(45,35,24,0.42)]"
          >
            <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_13rem] lg:p-5">
              <div className="relative min-h-[24rem] overflow-hidden rounded-[1.8rem] bg-muted">
                <SafeImage
                  src={displayImage}
                  alt={villa.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10" />
                <div className="absolute inset-x-5 bottom-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.32em] text-white/70">
                      {t("featured")}
                    </p>
                    <h1 className="font-display text-4xl tracking-[0.03em] text-white md:text-5xl">
                      {villa.name}
                    </h1>
                  </div>
                  <Badge className="rounded-full border border-white/15 bg-black/35 px-4 py-2 text-white backdrop-blur-sm">
                    {formatCurrency(villa.pricePerNight, locale)} / {t("perNight")}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {availableThumbs.map((url, index) => (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative min-h-32 overflow-hidden rounded-[1.35rem] border transition-all ${
                      selectedImage === index
                        ? "border-primary shadow-[0_14px_32px_-20px_rgba(90,60,30,0.5)]"
                        : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <SafeImage
                      src={url}
                      alt={`${villa.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  </button>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[2.1rem] border border-border/70 bg-card/90 p-7 shadow-[0_18px_56px_-34px_rgba(45,35,24,0.35)] md:p-9"
          >
            <div className="flex flex-col gap-6 border-b border-border/70 pb-8 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.3em] text-primary/75">
                  {t("listingTitle")}
                </p>
                <h2 className="font-display mt-3 text-4xl tracking-[0.03em] md:text-[3.2rem]">
                  {villa.name}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  {villa.description}
                </p>
              </div>
              {avgRating > 0 && (
                <div className="rounded-[1.6rem] border border-border/70 bg-background/75 px-5 py-4 text-right backdrop-blur-sm">
                  <div className="flex items-center justify-end gap-2 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-lg font-semibold text-foreground">
                      {avgRating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {reviews.length} {t("reviews")}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-border/60 bg-background/70 p-5">
                <Bed className="h-5 w-5 text-primary" />
                <p className="mt-4 text-2xl font-semibold">{villa.bedrooms}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {t("bedrooms")}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-border/60 bg-background/70 p-5">
                <Bath className="h-5 w-5 text-primary" />
                <p className="mt-4 text-2xl font-semibold">{villa.bathrooms}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {t("bathrooms")}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-border/60 bg-background/70 p-5">
                <Users className="h-5 w-5 text-primary" />
                <p className="mt-4 text-2xl font-semibold">{villa.maxGuests}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {t("maxGuests")}
                </p>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="rounded-[2rem] border border-border/70 bg-card/90 p-7 shadow-[0_16px_48px_-34px_rgba(45,35,24,0.28)]"
            >
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-primary/75">
                {t("amenities")}
              </p>
              <h3 className="font-display mt-3 text-3xl tracking-[0.03em]">
                {t("amenities")}
              </h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {villa.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-[1.25rem] border border-border/60 bg-background/75 px-4 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {amenityIcons[amenity] ?? (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">
                      {amenityLabels[amenity as keyof typeof amenityLabels] ??
                        amenity.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="rounded-[2rem] border border-border/70 bg-gradient-to-br from-primary/[0.06] to-transparent p-7 shadow-[0_16px_48px_-34px_rgba(45,35,24,0.28)]"
            >
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-primary/75">
                {t("pricing")}
              </p>
              <h3 className="font-display mt-3 text-3xl tracking-[0.03em]">
                {formatCurrency(villa.pricePerNight, locale)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("perNight")}</p>
              <Separator className="my-6" />
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <CalendarRange className="mt-0.5 h-4 w-4 text-primary" />
                  <p>{t("reservationNote")}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 text-primary" />
                  <p>{t("guestNote", { guests: villa.maxGuests })}</p>
                </div>
              </div>
            </motion.section>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="rounded-[2rem] border border-border/70 bg-card/90 p-7 shadow-[0_16px_48px_-34px_rgba(45,35,24,0.28)]"
          >
            <div className="flex flex-col gap-2 border-b border-border/70 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.28em] text-primary/75">
                  {t("reviews")}
                </p>
                <h3 className="font-display mt-3 text-3xl tracking-[0.03em]">
                  {t("reviews")}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {reviews.length} {t("reviews")}
              </p>
            </div>

            {reviews.length === 0 ? (
              <p className="pt-6 text-sm text-muted-foreground">{t("noReviews")}</p>
            ) : (
              <div className="space-y-5 pt-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[1.5rem] border border-border/60 bg-background/70 p-5"
                  >
                    <div className="flex gap-4">
                      <Avatar className="h-11 w-11 border border-border/60">
                        <AvatarImage src={review.guestAvatar || undefined} />
                        <AvatarFallback>{review.guestName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{review.guestName}</p>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                              {formatLongDate(review.createdAt, locale)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${
                                  index < review.rating
                                    ? "fill-current"
                                    : "fill-transparent text-muted-foreground/35"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:pt-16"
        >
          <div className="sticky top-28 rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_24px_80px_-36px_rgba(45,35,24,0.45)] backdrop-blur-sm">
            <div className="border-b border-border/70 pb-5">
              <p className="text-[0.7rem] uppercase tracking-[0.3em] text-primary/75">
                {t("bookNow")}
              </p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-4xl tracking-[0.03em] text-foreground">
                    {formatCurrency(villa.pricePerNight, locale)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("perNight")}</p>
                </div>
                {avgRating > 0 && (
                  <Badge variant="outline" className="rounded-full border-border/70 bg-background/70 px-3 py-1 text-foreground">
                    <Star className="mr-1 h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {avgRating.toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-center overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/65">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                disabled={[{ before: new Date() }, ...disabledDates]}
                excludeDisabled
                numberOfMonths={1}
                locale={calendarLocale}
                className="w-full"
              />
            </div>

            {dateRange?.from && dateRange?.to && nights > 0 && (
              <div className="mt-6 rounded-[1.5rem] border border-border/60 bg-background/70 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {formatLocalDateRange(dateRange.from, dateRange.to, locale)}
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-muted-foreground">
                    <span>
                      {t("nightsCalculation", {
                        nights,
                        price: formatCurrency(villa.pricePerNight, locale),
                      })}
                    </span>
                    <span className="text-foreground">{formatCurrency(totalPrice, locale)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>{t("summaryTotalLabel")}</span>
                    <span>{formatCurrency(totalPrice, locale)}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              size="lg"
              className="mt-6 h-12 w-full rounded-full"
              disabled={nights === 0}
              onClick={handleBookNow}
            >
              {t("bookNow")}
            </Button>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
