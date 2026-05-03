import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { VillaForm } from "../villa-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");

  return {
    title: t("addVilla"),
  };
}

export default function AdminNewVillaPage() {
  return <VillaForm mode="create" />;
}
