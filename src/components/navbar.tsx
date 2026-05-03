"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { Hotel, Menu } from "lucide-react";
import { useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isAdmin =
    (session?.user as Record<string, unknown> | undefined)?.role === "ADMIN" ||
    (session?.user as Record<string, unknown> | undefined)?.role === "SUPER_ADMIN";

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/villas", label: t("villas") },
    { href: "/about", label: t("about") },
  ];

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4">
      <div className="container mx-auto flex h-16 items-center justify-between rounded-full border border-white/10 bg-background/76 px-4 shadow-[0_20px_60px_-30px_rgba(33,24,16,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 rounded-full px-2 py-1.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <Hotel className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-[0.08em] text-foreground">
            ResortsGeh
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/65 p-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {session && (
            <Link
              href="/my-bookings"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive("/my-bookings")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("myBookings")}
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive("/admin")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("admin")}
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name}
                    />
                    <AvatarFallback>
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings">{t("myBookings")}</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">{t("admin")}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.reload(); } } })}
                  className="text-destructive"
                >
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button size="sm" className="rounded-full px-5" asChild>
                <Link href="/register">{t("register")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 flex flex-col">
              <SheetTitle className="sr-only">{t("mobileMenuTitle")}</SheetTitle>
              <SheetDescription className="sr-only">{t("mobileMenuDescription")}</SheetDescription>
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-5 border-b">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <Hotel className="h-4 w-4" />
                </span>
                <span className="font-display text-2xl font-semibold tracking-[0.08em] text-foreground">
                  ResortsGeh
                </span>
              </div>

              {/* User info */}
              {session && (
                <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/30">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name} />
                    <AvatarFallback>{session.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex flex-col px-3 py-3 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {session && (
                  <Link
                    href="/my-bookings"
                    onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    {t("myBookings")}
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    {t("admin")}
                  </Link>
                )}
              </nav>

              {/* Footer actions */}
              <div className="px-4 py-4 border-t mt-auto flex flex-col gap-2">
                {session ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setOpen(false);
                      signOut({ fetchOptions: { onSuccess: () => { window.location.reload(); } } });
                    }}
                  >
                    {t("logout")}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/login" onClick={() => setOpen(false)}>{t("login")}</Link>
                    </Button>
                    <Button size="sm" className="w-full" asChild>
                      <Link href="/register" onClick={() => setOpen(false)}>{t("register")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
