"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/formatters";

function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  locale,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  locale: string;
}) {
  return <span>{prefix}{formatNumber(target, locale)}{suffix}</span>;
}

interface HeroStat {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export function HeroSection({ stats }: { stats: HeroStat[] }) {
  const t = useTranslations("hero");
  const locale = useLocale();

  return (
    <section className="relative flex min-h-[95svh] items-center overflow-hidden bg-black pt-28 pb-16">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Eyebrow */}
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-5 py-2.5 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              <span className="text-[0.68rem] font-semibold tracking-[0.34em] uppercase text-amber-100/90">
                {t("eyebrow")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="font-display text-5xl leading-[0.9] tracking-[0.02em] text-white sm:text-6xl md:text-7xl lg:text-[5.8rem]"
            >
              <span className="block">{t("titleLine1")}</span>
              <span className="mt-1 block bg-gradient-to-r from-stone-100 via-amber-100 to-amber-300 bg-clip-text text-transparent">
                {t("titleLine2")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-8 max-w-2xl text-base leading-relaxed text-white/68 md:text-lg"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="group h-14 rounded-full bg-white px-8 text-base font-semibold text-black hover:bg-white/90"
                asChild
              >
                <Link href="/villas">
                  {t("explore")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-white/20 bg-black/20 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/about">{t("ourStory")}</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4"
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-white/10 bg-white/7 px-5 py-5 backdrop-blur-sm"
                >
                  <div className="font-display text-3xl text-white md:text-4xl">
                    <AnimatedCounter
                      target={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      locale={locale}
                    />
                  </div>
                  <div className="mt-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/48 md:text-[0.72rem]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="hidden rounded-[2rem] border border-white/12 bg-black/30 p-6 text-white shadow-[0_40px_100px_-40px_rgba(0,0,0,0.85)] backdrop-blur-md lg:block"
          >
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/45">
              {t("panelLabel")}
            </p>
            <div className="mt-6 space-y-4">
              {stats.slice(0, 3).map((stat, i) => (
                <div key={i} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                  <div className="font-display text-4xl text-white">
                    <AnimatedCounter
                      target={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      locale={locale}
                    />
                  </div>
                  <p className="mt-1 text-sm text-white/58">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm leading-relaxed text-white/55">{t("panelCopy")}</p>
          </motion.aside>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
