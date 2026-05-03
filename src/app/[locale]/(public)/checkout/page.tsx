import { db } from "@/db";
import { villas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";
import type { Metadata } from "next";
import { localizePath } from "@/lib/revalidate";
import { getTranslations } from "next-intl/server";

const SITE_TIME_ZONE = "Asia/Jakarta";

function getSiteDateString() {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("booking");

  return {
    title: t("title"),
  };
}

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ villaId?: string; checkIn?: string; checkOut?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { villaId, checkIn, checkOut } = await searchParams;

  if (!villaId || !checkIn || !checkOut) {
    redirect(localizePath("/villas", locale));
  }

  const villa = await db.query.villas.findFirst({
    where: eq(villas.id, villaId),
  });

  if (!villa) redirect(localizePath("/villas", locale));
  if (villa.status !== "AVAILABLE") redirect(localizePath("/villas", locale));

  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (
    Number.isNaN(new Date(checkIn).getTime()) ||
    Number.isNaN(new Date(checkOut).getTime()) ||
    nights <= 0 ||
    checkIn < getSiteDateString()
  ) {
    redirect(localizePath(`/villas/${villa.slug}`, locale));
  }

  return (
    <CheckoutClient
      villa={villa}
      checkIn={checkIn}
      checkOut={checkOut}
      nights={nights}
      totalPrice={nights * villa.pricePerNight}
    />
  );
}
