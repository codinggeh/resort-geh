import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { isPublicDemoModeEnabled } from "@/lib/demo-mode";

export async function DemoBanner() {
  if (!isPublicDemoModeEnabled()) {
    return null;
  }

  const t = await getTranslations("demo");

  return (
    <div className="bg-amber-500/12 text-amber-950 dark:bg-amber-400/10 dark:text-amber-100">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-3 px-4 py-2 text-center text-xs font-medium sm:text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="leading-snug">{t("banner")}</span>
        <Link
          href="/disclaimer"
          className="inline-flex items-center gap-1 rounded-full border border-amber-700/30 bg-amber-500/20 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-950 transition-colors hover:bg-amber-500/30 dark:border-amber-300/25 dark:text-amber-100"
        >
          {t("bannerCta")}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
