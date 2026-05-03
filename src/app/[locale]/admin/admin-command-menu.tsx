"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { searchAdmin } from "@/actions/admin";
import { CalendarRange, User } from "lucide-react";
import { useTranslations } from "next-intl";

export function AdminCommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    bookings: Array<{
      id: string;
      villa: { name: string } | null;
      guest: { name: string; email: string } | null;
    }>;
    users: Array<{ id: string; name: string; email: string; role: string }>;
  }>({ bookings: [], users: [] });
  const router = useRouter();
  const t = useTranslations("admin");
  const tc = useTranslations("common");

  // Derived results: only show when query is long enough
  const displayResults = useMemo(
    () => (query.length < 2 ? { bookings: [], users: [] } : results),
    [query, results]
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setQuery("");
      setResults({ bookings: [], users: [] });
    }
  }

  // Cmd+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) return;

    let isActive = true;

    const timer = setTimeout(async () => {
      try {
        const data = await searchAdmin(query);
        if (isActive) {
          setResults(data as typeof results);
        }
      } catch {
        // silently fail
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t("commandPaletteTitle")}
      description={t("commandPaletteDescription")}
    >
      <CommandInput
        placeholder={t("commandSearch")}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{tc("noResults")}</CommandEmpty>

        {displayResults.bookings.length > 0 && (
          <CommandGroup heading={t("bookings")}>
            {displayResults.bookings.map((booking) => (
              <CommandItem
                key={booking.id}
                onSelect={() => {
                  setOpen(false);
                  router.push("/admin/bookings");
                }}
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                <div>
                  <span className="font-mono text-xs">{booking.id.substring(0, 8)}...</span>
                  <span className="ml-2 text-sm">
                    {booking.villa?.name} — {booking.guest?.name}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {displayResults.users.length > 0 && (
          <CommandGroup heading={t("users")}>
            {displayResults.users.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => {
                  setOpen(false);
                  router.push("/admin/users");
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{user.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {user.email}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
