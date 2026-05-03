import { db } from "@/db";
import { villas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { VillaForm } from "../../villa-form";

interface Props {
  params: Promise<{ villaId: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");

  return {
    title: t("editVilla"),
  };
}

export default async function AdminEditVillaPage({ params }: Props) {
  const { villaId } = await params;

  const villa = await db.query.villas.findFirst({
    where: eq(villas.id, villaId),
  });

  if (!villa) {
    notFound();
  }

  return (
    <VillaForm
      mode="edit"
      villa={{
        id: villa.id,
        name: villa.name,
        slug: villa.slug,
        description: villa.description,
        pricePerNight: villa.pricePerNight,
        maxGuests: villa.maxGuests,
        bedrooms: villa.bedrooms,
        bathrooms: villa.bathrooms,
        amenities: villa.amenities,
        imageUrls: villa.imageUrls,
        status: villa.status,
      }}
    />
  );
}
