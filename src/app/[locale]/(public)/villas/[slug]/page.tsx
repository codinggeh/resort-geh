import { db } from "@/db";
import { villas, reviews } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VillaDetailClient } from "./villa-detail-client";
import { getBookedDates } from "@/actions/booking";
import { getTranslations } from "next-intl/server";
import { localizePath } from "@/lib/revalidate";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations("villa");
  const villa = await db.query.villas.findFirst({
    where: and(eq(villas.slug, slug), eq(villas.status, "AVAILABLE")),
  });

  if (!villa) return { title: t("notFoundTitle") };

  return {
    title: villa.name,
    description: villa.description,
    alternates: {
      canonical: localizePath(`/villas/${villa.slug}`, locale),
    },
    openGraph: {
      title: villa.name,
      description: villa.description,
      images: villa.imageUrls[0]
        ? [
            {
              url: villa.imageUrls[0],
              alt: villa.name,
            },
          ]
        : undefined,
    },
  };
}

export default async function VillaDetailPage({ params }: Props) {
  const { slug } = await params;
  const villa = await db.query.villas.findFirst({
    where: and(eq(villas.slug, slug), eq(villas.status, "AVAILABLE")),
  });

  if (!villa) notFound();

  const villaReviews = await db.query.reviews.findMany({
    where: eq(reviews.villaId, villa.id),
    with: { guest: true },
    orderBy: (reviews: any, { desc }: any) => [desc(reviews.createdAt)],
  });

  const bookedDates = await getBookedDates(villa.id);

  return (
    <VillaDetailClient
      villa={villa}
      reviews={villaReviews.map((r: any) => ({
        ...r,
        guestName: r.guest.name,
        guestAvatar: r.guest.avatarUrl,
      }))}
      bookedDates={bookedDates}
    />
  );
}
