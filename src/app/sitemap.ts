import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";
import { locales } from "@/i18n/routing";
import { localizePath } from "@/lib/revalidate";

const publicPaths = ["/", "/about", "/villas", "/disclaimer"];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let villaPages: { slug: string; createdAt: Date | null }[] = [];
  try {
    const { db } = await import("@/db");
    const { villas } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    villaPages = await db.query.villas.findMany({
      where: eq(villas.status, "AVAILABLE"),
      columns: {
        slug: true,
        createdAt: true,
      },
      orderBy: (table: any, { desc }: any) => [desc(table.createdAt)],
    });
  } catch {
    // DB unavailable at build time — return static entries only
  }

  const staticEntries = locales.flatMap((locale) =>
    publicPaths.map((path) => ({
      url: `${SITE_URL}${localizePath(path, locale)}`,
      lastModified: now,
      changeFrequency: (path === "/" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: path === "/" ? 1 : 0.7,
    }))
  );

  const villaEntries = locales.flatMap((locale) =>
    villaPages.map((villa: any) => ({
      url: `${SITE_URL}${localizePath(`/villas/${villa.slug}`, locale)}`,
      lastModified: villa.createdAt ? new Date(villa.createdAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  return [...staticEntries, ...villaEntries];
}
