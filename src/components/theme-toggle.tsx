"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  variant?: "icon" | "pill" | "list";
  className?: string;
  align?: "start" | "end";
  label?: string;
};

export function ThemeToggle({
  variant = "icon",
  className,
  align = "end",
  label,
}: ThemeToggleProps) {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const t = useTranslations("common");
  const currentTheme = theme === "system" ? "system" : resolvedTheme ?? "system";

  const themeLabel =
    currentTheme === "light"
      ? t("light")
      : currentTheme === "dark"
        ? t("dark")
        : t("system");

  const ThemeIcon =
    currentTheme === "light"
      ? Sun
      : currentTheme === "dark"
        ? Moon
        : Monitor;

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
          {variant === "pill" || variant === "list" ? (
            <span className="inline-flex items-center gap-2">
              <ThemeIcon className="h-4 w-4" />
              {variant === "list" ? <span>{label ?? t("toggleTheme")}</span> : null}
            </span>
          ) : (
            <>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </>
          )}
          {variant === "pill" ? (
            <span className="text-xs font-medium tracking-[0.18em]">
              {themeLabel}
            </span>
          ) : null}
          {variant === "list" ? (
            <span className="text-xs text-muted-foreground">
              {themeLabel}
            </span>
          ) : null}
          <span className="sr-only">{t("toggleTheme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
