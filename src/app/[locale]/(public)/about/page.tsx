import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/lib/constants/site";
import { Gem, Globe, Users, Award, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  const values = [
    { icon: Gem, titleKey: "valueLuxuryTitle" as const, descKey: "valueLuxuryDesc" as const },
    { icon: Globe, titleKey: "valueSustainTitle" as const, descKey: "valueSustainDesc" as const },
    { icon: Users, titleKey: "valueCommunityTitle" as const, descKey: "valueCommunityDesc" as const },
    { icon: Award, titleKey: "valueExcellenceTitle" as const, descKey: "valueExcellenceDesc" as const },
  ];

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden bg-black py-28 md:py-36">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80"
            alt={t("heroAlt")}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/82 via-black/58 to-black/40" />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-amber-200/72">
            {t("eyebrow")}
          </p>
          <h1 className="font-display mt-5 max-w-4xl text-5xl tracking-[0.03em] text-white md:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-16 md:pt-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
          <div className="rounded-[2.2rem] border border-border/70 bg-card/90 p-7 shadow-[0_24px_70px_-40px_rgba(45,35,24,0.35)] md:p-10">
            <p className="text-[0.72rem] uppercase tracking-[0.3em] text-primary/75">
              {t("storyEyebrow")}
            </p>
            <h2 className="font-display mt-4 text-4xl tracking-[0.03em] md:text-5xl">
              {t("storyTitle")}
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
              <p>{t("storyP1")}</p>
              <p>{t("storyP2")}</p>
            </div>
          </div>

          <div className="relative min-h-[24rem] overflow-hidden rounded-[2.2rem] border border-border/70 bg-muted shadow-[0_24px_70px_-40px_rgba(45,35,24,0.35)]">
            <Image
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80"
              alt={t("storyImageAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-16 md:pt-20">
        <div className="mb-10">
          <p className="text-[0.72rem] uppercase tracking-[0.3em] text-primary/75">
            {t("valuesEyebrow")}
          </p>
          <h2 className="font-display mt-4 text-4xl tracking-[0.03em] md:text-5xl">
            {t("valuesTitle")}
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.titleKey}
              className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-[0_18px_56px_-34px_rgba(45,35,24,0.32)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <value.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{t(value.titleKey)}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(value.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-16 md:pt-20">
        <div className="overflow-hidden rounded-[2.2rem] border border-primary/15 bg-gradient-to-br from-primary via-primary to-primary/85 px-8 py-10 text-primary-foreground shadow-[0_30px_90px_-45px_rgba(49,34,18,0.8)] md:px-12 md:py-14">
          <p className="text-[0.72rem] uppercase tracking-[0.3em] text-primary-foreground/72">
            {t("projectEyebrow")}
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h2 className="font-display text-4xl tracking-[0.03em] md:text-5xl">{t("projectTitle")}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-primary-foreground/82 md:text-base">
                {t("projectDesc")}
              </p>
              <p className="mt-6 text-sm text-primary-foreground/72">
                {SITE_CONFIG.developer.name} · {SITE_CONFIG.developer.socials.github.replace("https://github.com/", "github.com/")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild variant="secondary" className="rounded-full px-6">
                <Link href="/disclaimer">{t("projectCta")}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/20 bg-transparent px-6 text-primary-foreground hover:bg-white/10">
                <a href={SITE_CONFIG.developer.socials.github} target="_blank" rel="noopener noreferrer">
                  GitHub <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
