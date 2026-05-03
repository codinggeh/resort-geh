import { useTranslations } from "next-intl";
import { Hotel, Github } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/lib/constants/site";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-10 border-t border-stone-800/80 bg-[radial-gradient(circle_at_top,rgba(181,128,74,0.18),transparent_34%),linear-gradient(180deg,rgba(40,31,24,1)_0%,rgba(19,15,12,1)_100%)] text-stone-100">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.1fr_0.8fr_0.8fr]">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-stone-100">
                <Hotel className="h-5 w-5" />
              </span>
              <span className="font-display text-3xl tracking-[0.08em]">{t("brand")}</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-stone-300">
              {t("tagline")}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <LocaleSwitcher
                variant="pill"
                align="start"
                className="border border-white/15 bg-white/8 text-stone-100 hover:bg-white/12 hover:text-white"
              />
              <ThemeToggle
                variant="pill"
                align="start"
                className="border border-white/15 bg-white/8 text-stone-100 hover:bg-white/12 hover:text-white"
              />
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-400">{t("quickLinks")}</h3>
            <div className="flex flex-col gap-2 text-sm text-stone-300">
              <Link href="/villas" className="transition-colors hover:text-white">
                {t("browseVillas")}
              </Link>
              <Link href="/about" className="transition-colors hover:text-white">
                {t("aboutUs")}
              </Link>
              <Link href="/login" className="transition-colors hover:text-white">
                {t("signIn")}
              </Link>
              <Link href="/disclaimer" className="transition-colors hover:text-white">
                {t("disclaimer")}
              </Link>
            </div>
          </div>

          {/* Branding watermark */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-400">{t("developer")}</h3>
            <div className="space-y-3 text-sm text-stone-300">
              <p>
                {t("projectBy")}{" "}
                <a
                  href={SITE_CONFIG.developer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-stone-100 transition-colors hover:text-white"
                >
                  {SITE_CONFIG.developer.name}
                </a>
              </p>
              <div className="flex gap-3">
                <a
                  href={SITE_CONFIG.developer.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-300 transition-colors hover:text-white"
                >
                  <Github className="h-5 w-5" />
                </a>

              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8 text-center text-sm text-stone-300">
          <p>
            &copy; {new Date().getFullYear()} {t("brand")}. {t("rights")}{" "}
            {t("projectBy")}{" "}
            <a
              href={SITE_CONFIG.developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-100 transition-colors hover:text-white"
            >
              {SITE_CONFIG.developer.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
