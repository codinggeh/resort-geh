import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/lib/constants/site";
import { Info, ImageIcon, FileText, Shield, Github, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("disclaimer");

  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default async function DisclaimerPage() {
  const t = await getTranslations("disclaimer");

  const sections = [
    { icon: Info, titleKey: "contentTitle" as const, descKey: "contentDesc" as const },
    { icon: ImageIcon, titleKey: "imagesTitle" as const, descKey: "imagesDesc" as const },
    { icon: FileText, titleKey: "purposeTitle" as const, descKey: "purposeDesc" as const },
    { icon: Shield, titleKey: "privacyTitle" as const, descKey: "privacyDesc" as const },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backHome")}
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="rounded-[2.25rem] border border-border/70 bg-card/90 p-7 shadow-[0_24px_70px_-40px_rgba(45,35,24,0.35)] md:p-10">
          <p className="text-[0.72rem] uppercase tracking-[0.3em] text-primary/75">
            {t("contextLabel")}
          </p>
          <h1 className="font-display mt-4 text-4xl tracking-[0.03em] md:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            {t("intro")}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            {t("introNotice")}
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <div
                key={section.titleKey}
                className="rounded-[1.6rem] border border-border/60 bg-background/75 p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <section.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {t(section.titleKey)}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {t(section.descKey)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6 lg:pt-12">
          <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-[0_18px_56px_-34px_rgba(45,35,24,0.32)]">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-primary/75">
              {t("accountsTitle")}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {t("accountsDesc")}
            </p>
            <div className="mt-5 space-y-3">
              {SITE_CONFIG.testAccounts.map((account) => (
                <div
                  key={account.email}
                  className="rounded-[1.4rem] border border-border/60 bg-background/75 p-4"
                >
                  <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">
                    {account.role}
                  </span>
                  <p className="mt-3 break-all font-mono text-sm text-foreground">{account.email}</p>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">{account.password}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-[0_18px_56px_-34px_rgba(45,35,24,0.32)]">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-primary/75">
              {t("developerLabel")}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {t("developerTagline")}
            </p>
            <p className="mt-4 font-medium text-foreground">
              {t("developerLine")} {SITE_CONFIG.developer.name}
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={SITE_CONFIG.developer.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
