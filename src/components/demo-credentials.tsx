"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants/site";

interface DemoCredentialsProps {
  onUseAccount: (values: { email: string; password: string }) => void;
}

export function DemoCredentials({ onUseAccount }: DemoCredentialsProps) {
  const t = useTranslations("demo");

  return (
    <div className="rounded-[1.4rem] border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-left">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{t("loginHintTitle")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("loginHintDescription")}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {SITE_CONFIG.testAccounts.map((account) => (
          <li
            key={account.email}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-2"
          >
            <div className="min-w-0 text-left">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary">
                {account.role}
              </p>
              <p className="mt-1 truncate font-mono text-xs text-foreground">{account.email}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() =>
                onUseAccount({ email: account.email, password: account.password })
              }
            >
              {t("useAccount", { role: account.role })}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
