import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";
import { locales } from "@/i18n/routing";
import { localizePath } from "@/lib/revalidate";
import { db } from "@/db";
import { villas } from "@/db/schema";
import { eq } from "drizzle-orm";

const publicPaths = ["/", "/about", "/villas", "/disclaimer"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const villaPages = await db.query.villas.findMany({
    where: eq(villas.status, "AVAILABLE"),
    columns: {
      slug: true,
      createdAt: true,
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  const staticEntries = locales.flatMap((locale) =>
    publicPaths.map((path) => ({
      url: `${SITE_URL}${localizePath(path, locale)}`,
      lastModified: now,
      changeFrequency: (path === "/" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: path === "/" ? 1 : 0.7,
    }))
  );

  const villaEntries = locales.flatMap((locale) =>
    villaPages.map((villa) => ({
      url: `${SITE_URL}${localizePath(`/villas/${villa.slug}`, locale)}`,
      lastModified: villa.createdAt ? new Date(villa.createdAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  return [...staticEntries, ...villaEntries];
}
