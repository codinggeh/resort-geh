import { getUserBookings } from "@/actions/booking";
import { getAuthSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { MyBookingsClient } from "./my-bookings-client";
import type { Metadata } from "next";
import { localizePath } from "@/lib/revalidate";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("booking");

  return {
    title: t("pageTitle"),
  };
}

export default async function MyBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAuthSession();
  if (!session) {
    const nextPath = localizePath("/my-bookings", locale);
    redirect(`${localizePath("/login", locale)}?next=${encodeURIComponent(nextPath)}`);
  }

  const bookings = await getUserBookings();

  return <MyBookingsClient bookings={bookings} />;
}
