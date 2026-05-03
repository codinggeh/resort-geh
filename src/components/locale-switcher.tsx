"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const localeLabels: Record<string, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

type LocaleSwitcherProps = {
  variant?: "icon" | "pill" | "list";
  className?: string;
  align?: "start" | "end";
  label?: string;
};

export function LocaleSwitcher({
  variant = "icon",
  className,
  align = "end",
  label,
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations("common");

  function switchLocale(newLocale: string) {
    if (newLocale === locale) {
      return;
    }

    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { locale: newLocale });
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "list" ? "outline" : "ghost"}
          size={variant === "icon" ? "icon" : "sm"}
          className={cn(
            variant === "pill" && "justify-start rounded-full px-4",
            variant === "list" && "w-full justify-between rounded-xl px-3",
            className
          )}
        >
          <span className="inline-flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {variant === "list" ? (
              <span>{label ?? t("switchLanguage")}</span>
            ) : null}
          </span>
          {variant === "pill" ? (
            <span className="text-xs font-medium tracking-[0.18em]">
              {locale.toUpperCase()}
            </span>
          ) : null}
          {variant === "list" ? (
            <span className="text-xs text-muted-foreground">
              {localeLabels[locale] ?? locale.toUpperCase()}
            </span>
          ) : null}
          <span className="sr-only">{t("switchLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {Object.entries(localeLabels).map(([nextLocale, label]) => (
          <DropdownMenuItem key={nextLocale} onClick={() => switchLocale(nextLocale)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
