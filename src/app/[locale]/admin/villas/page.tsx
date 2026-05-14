import { getAllVillasAdmin } from "@/actions/admin";
import { getTranslations } from "next-intl/server";
import { VillasClient } from "./villas-client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");

  return {
    title: t("villas"),
  };
}

export default async function AdminVillasPage() {
  const t = await getTranslations("admin");
  const rawVillas = await getAllVillasAdmin();

  const villas = rawVillas.map((v: any) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    description: v.description,
    pricePerNight: v.pricePerNight,
    maxGuests: v.maxGuests,
    bedrooms: v.bedrooms,
    bathrooms: v.bathrooms,
    amenities: v.amenities,
    imageUrls: v.imageUrls,
    status: v.status,
    createdAt: v.createdAt,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("villas")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("villasDesc")}
        </p>
      </div>

      <VillasClient villas={villas} />
    </div>
  );
}
