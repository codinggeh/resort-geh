import { db } from "@/db";
import { villas, reviews, bookings } from "@/db/schema";
import { eq, avg, count, sql } from "drizzle-orm";
import { HeroSection } from "./hero-section";
import { VillaCard } from "@/components/villa-card";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Gem, HeartHandshake } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function HomePage() {
  const t = await getTranslations("villa");
  const th = await getTranslations("home");
  const thero = await getTranslations("hero");

  const featuredVillas = await db.query.villas.findMany({
    where: eq(villas.status, "AVAILABLE"),
    orderBy: (villas, { desc }) => [desc(villas.createdAt)],
    limit: 3,
  });

  const availableVillaStats = await db
    .select({
      count: count(),
      nightlyFrom: sql<number | null>`MIN(${villas.pricePerNight})`,
    })
    .from(villas)
    .where(eq(villas.status, "AVAILABLE"))
    .get();

  const ratingsData = await db
    .select({
      villaId: reviews.villaId,
      avgRating: avg(reviews.rating),
      reviewCount: count(),
    })
    .from(reviews)
    .groupBy(reviews.villaId);

  const ratingsMap = new Map(
    ratingsData.map((r) => [
      r.villaId,
      { avg: Number(r.avgRating) || 0, count: r.reviewCount },
    ])
  );
  const totalReviewCount = ratingsData.reduce((sum, rating) => sum + rating.reviewCount, 0);
  const availableVillaCount = availableVillaStats?.count ?? 0;
  const nightlyFrom = availableVillaStats?.nightlyFrom ?? 0;
  const bookingTotals = await db.select({ count: count() }).from(bookings).get();

  const features = [
    { icon: Shield, titleKey: "featureSecureTitle" as const, descKey: "featureSecureDesc" as const },
    { icon: Clock, titleKey: "feature24Title" as const, descKey: "feature24Desc" as const },
    { icon: Gem, titleKey: "featureCuratedTitle" as const, descKey: "featureCuratedDesc" as const },
    { icon: HeartHandshake, titleKey: "featurePersonalTitle" as const, descKey: "featurePersonalDesc" as const },
  ];

  return (
    <>
      <HeroSection
        stats={[
          { value: availableVillaCount, label: thero("statVillas") },
          { value: totalReviewCount, label: thero("statReviews"), suffix: "+" },
          { value: nightlyFrom, label: thero("statFrom"), prefix: "$" },
          { value: bookingTotals?.count ?? 0, label: thero("statBookings") },
        ]}
      />

      {/* Why ResortsGeh */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-3">
            {th("whyEyebrow")}
          </p>
          <h2 className="font-display text-4xl tracking-[0.03em] md:text-5xl mb-4">{th("whyTitle")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{th("whySubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-[0_16px_42px_-28px_rgba(45,35,24,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(45,35,24,0.38)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display mb-3 text-[2rem] leading-none tracking-[0.03em]">{th(f.titleKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{th(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Villas — max 3 */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-3">
                {th("featuredEyebrow")}
              </p>
              <h2 className="font-display text-4xl tracking-[0.03em] md:text-5xl">{t("featured")}</h2>
            </div>
            <Button variant="outline" className="hidden sm:inline-flex gap-2 rounded-full" asChild>
              <Link href="/villas">
                {t("viewAll")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVillas.map((villa) => {
              const rating = ratingsMap.get(villa.id);
              return (
                <VillaCard
                  key={villa.id}
                  villa={villa}
                  avgRating={rating?.avg ?? 0}
                  reviewCount={rating?.count ?? 0}
                  priority={villa.id === featuredVillas[0]?.id}
                />
              );
            })}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Button variant="outline" className="gap-2 rounded-full" asChild>
              <Link href="/villas">
                {t("viewAll")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-primary/15 bg-gradient-to-br from-primary via-primary to-primary/85 p-12 text-center shadow-[0_30px_90px_-45px_rgba(49,34,18,0.8)] md:p-20">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSIjZmZmIi8+PC9zdmc+')]" />
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <h2 className="relative font-display text-4xl tracking-[0.03em] text-primary-foreground md:text-6xl mb-4">
            {th("ctaTitle")}
          </h2>
          <p className="relative text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {th("ctaSubtitle")}
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="relative h-14 px-10 rounded-full text-base font-semibold"
            asChild
          >
            <Link href="/villas">{th("ctaButton")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
