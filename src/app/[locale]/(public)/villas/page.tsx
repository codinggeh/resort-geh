import { db } from "@/db";
import { villas, reviews } from "@/db/schema";
import { eq, avg, count } from "drizzle-orm";
import { VillaCard } from "@/components/villa-card";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("villa");

  return {
    title: t("listingTitle"),
    description: t("listingSubtitle"),
  };
}

export default async function VillasPage() {
  const t = await getTranslations("villa");

  const allVillas = await db.query.villas.findMany({
    where: eq(villas.status, "AVAILABLE"),
    orderBy: (villas, { desc }) => [desc(villas.createdAt)],
  });

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("listingTitle")}</h1>
        <p className="text-muted-foreground">{t("listingSubtitle")}</p>
      </div>

      {allVillas.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          {t("emptyState")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allVillas.map((villa) => {
            const rating = ratingsMap.get(villa.id);
            return (
              <VillaCard
                key={villa.id}
                villa={villa}
                avgRating={rating?.avg ?? 0}
                reviewCount={rating?.count ?? 0}
                priority={villa.id === allVillas[0]?.id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
