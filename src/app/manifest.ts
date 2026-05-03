import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants/site";

export default function manifest(): MetadataRoute.Manifest {
  const iconVersion = "hotel-mark-v3";

  return {
    name: SITE_CONFIG.name,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#17120f",
    theme_color: "#2f241d",
    icons: [
      {
        src: `/icon.svg?v=${iconVersion}`,
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: `/apple-icon?v=${iconVersion}`,
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: `/favicon-hotel.ico?v=${iconVersion}`,
        sizes: "64x64",
        type: "image/x-icon",
      },
    ],
  };
}
