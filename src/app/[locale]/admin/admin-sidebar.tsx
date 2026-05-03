"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Hotel,
  CalendarRange,
  Users,
  LogOut,
  ArrowUpRight,
  ChevronsUpDown,
  Languages,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/lib/auth-client";
import { ThemeSetting } from "@/lib/constants/theme";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminSidebarProps {
  userRole: string;
  userName: string;
  userEmail: string;
}

export function AdminSidebar({
  userRole,
  userName,
  userEmail,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const { setTheme, resolvedTheme, theme } = useTheme();
  const roleLabel =
    userRole === "SUPER_ADMIN"
      ? t("roles.SUPER_ADMIN")
      : userRole === "ADMIN"
        ? t("roles.ADMIN")
        : userRole === "GUEST"
          ? t("roles.GUEST")
          : userRole;
  const currentTheme = theme === "system" ? "system" : resolvedTheme ?? "system";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const links = [
    {
      href: "/admin",
      label: t("dashboard"),
      icon: LayoutDashboard,
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      href: "/admin/villas",
      label: t("villas"),
      icon: Hotel,
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      href: "/admin/bookings",
      label: t("bookings"),
      icon: CalendarRange,
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      href: "/admin/users",
      label: t("users"),
      icon: Users,
      roles: ["SUPER_ADMIN"],
    },
  ];

  function switchLocale(nextLocale: string) {
    if (nextLocale === locale) {
      return;
    }

    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { locale: nextLocale });
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="p-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <Hotel className="h-6 w-6 text-primary" />
          <span>ResortsGeh</span>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          {t("adminPanel")} — {roleLabel}
        </p>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links
          .filter((link) => link.roles.includes(userRole))
          .map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
      </nav>

      <Separator />

      {/* Footer area */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-between rounded-2xl border border-border/70 bg-background/80 px-3 py-3 hover:bg-muted/40"
            >
              <span className="flex min-w-0 items-center gap-3 text-left">
                <Avatar size="lg">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {userName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {userEmail}
                  </span>
                </span>
              </span>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-60">
            <DropdownMenuLabel className="space-y-1">
              <div className="truncate text-sm font-semibold">{userName}</div>
              <div className="truncate text-xs font-normal text-muted-foreground">{userEmail}</div>
              <span className="inline-flex rounded-full border border-border/70 bg-muted/30 px-2 py-0.5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground">
                {roleLabel}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Monitor className="h-4 w-4" />
                {tc("toggleTheme")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuRadioGroup
                  value={currentTheme}
                  onValueChange={(value) => setTheme(value as ThemeSetting)}
                >
                  <DropdownMenuRadioItem value="light">
                    <Sun className="h-4 w-4" />
                    {tc("light")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon className="h-4 w-4" />
                    {tc("dark")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Monitor className="h-4 w-4" />
                    {tc("system")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="h-4 w-4" />
                {tc("switchLanguage")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuRadioGroup value={locale} onValueChange={switchLocale}>
                  <DropdownMenuRadioItem value="id">Bahasa Indonesia</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">
                <ArrowUpRight className="h-4 w-4" />
                {t("backToSite")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = locale === "en" ? "/" : `/${locale}`;
                    },
                  },
                })
              }
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
