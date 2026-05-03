import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import { SITE_CONFIG, SITE_URL } from "@/lib/constants/site";
import { defaultLocale } from "@/i18n/routing";
import { getThemeInitScript } from "@/lib/constants/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("metadata");
  const ogImage = "/opengraph-image";
  const iconVersion = "hotel-mark-v3";
  const languageAlternates = {
    en: SITE_URL,
    id: `${SITE_URL}/id`,
  };

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_CONFIG.name,
    title: {
      default: t("title"),
      template: `%s | ${SITE_CONFIG.name}`,
    },
    description: t("description"),
    alternates: {
      canonical: locale === defaultLocale ? "/" : `/${locale}`,
      languages: languageAlternates,
    },
    keywords: [
      "luxury villas",
      "villa booking",
      "resort",
      "ResortsGeh",
      "luxury accommodation",
      "portfolio project",
    ],
    authors: [{ name: SITE_CONFIG.developer.name, url: SITE_CONFIG.developer.url }],
    creator: SITE_CONFIG.developer.name,
    category: "travel",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: `/icon.svg?v=${iconVersion}`, type: "image/svg+xml" },
        { url: `/favicon-hotel.ico?v=${iconVersion}`, sizes: "64x64", type: "image/x-icon" },
      ],
      apple: [{ url: `/apple-icon?v=${iconVersion}`, sizes: "180x180", type: "image/png" }],
      shortcut: [`/favicon-hotel.ico?v=${iconVersion}`],
    },
    openGraph: {
      type: "website",
      siteName: SITE_CONFIG.name,
      locale,
      title: t("title"),
      description: t("description"),
      url: SITE_URL,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${SITE_CONFIG.name} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogImage],
    },
  };
}

function buildJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_URL,
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: SITE_CONFIG.developer.name,
      url: SITE_CONFIG.developer.url,
      sameAs: [SITE_CONFIG.developer.socials.github],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const jsonLd = buildJsonLd(locale);
  const themeInitScript = getThemeInitScript();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(jsonLd)}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
