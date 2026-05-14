"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { signUp } from "@/lib/auth-client";
import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { mapAuthProviderError, mapAuthValidationMessage } from "@/lib/auth-form";
import { getSafeNextPath } from "@/lib/safe-next-path";
import { isPublicDemoModeEnabled } from "@/lib/demo-mode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Loader2, ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const td = useTranslations("demo");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const demoEnabled = isPublicDemoModeEnabled();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    if (demoEnabled) {
      toast.error(td("readOnlyToast"));
      return;
    }

    setLoading(true);
    try {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error(mapAuthProviderError(result.error, t) || t("registerFailed"));
      } else {
        toast.success(t("registerSuccess"));
        router.push(nextPath);
        router.refresh();
      }
    } catch {
      toast.error(t("registerFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <div className="grid overflow-hidden rounded-[2.4rem] border border-border/70 bg-card/90 shadow-[0_28px_90px_-44px_rgba(45,35,24,0.4)] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex items-center px-5 py-8 md:px-8 md:py-12">
          <Card className="w-full rounded-[2rem] border-border/70 bg-background/80 shadow-none">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Hotel className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="font-display text-4xl tracking-[0.03em]">{t("register")}</CardTitle>
              <CardDescription>{t("registerDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {demoEnabled && (
                <div className="mb-5 flex items-start gap-3 rounded-[1.2rem] border border-amber-500/40 bg-amber-500/8 px-4 py-3 text-left">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
                  <p className="text-xs leading-5 text-amber-900 dark:text-amber-100">
                    {td("readOnly")} —{" "}
                    <Link href="/login" className="font-semibold underline">
                      {t("login")}
                    </Link>
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input id="name" className="h-12 rounded-xl" placeholder={t("namePlaceholder")} {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {mapAuthValidationMessage(errors.name.message, t)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-12 rounded-xl"
                    placeholder={t("emailPlaceholder")}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {mapAuthValidationMessage(errors.email.message, t)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    className="h-12 rounded-xl"
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {mapAuthValidationMessage(errors.password.message, t)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="h-12 rounded-xl"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {mapAuthValidationMessage(errors.confirmPassword.message, t)}
                    </p>
                  )}
                </div>
                <Button type="submit" className="h-12 w-full rounded-full" disabled={loading || demoEnabled}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("register")}
                </Button>
              </form>
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {t("hasAccount")} {" "}
                <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-medium text-primary hover:underline">
                  {t("login")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="relative min-h-[24rem] overflow-hidden px-8 py-10 md:px-12 md:py-14">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-bl from-black/80 via-black/56 to-black/32" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/72">
                {t("eyebrow")}
              </p>
              <h1 className="font-display mt-4 text-4xl tracking-[0.03em] text-white md:text-6xl">
                {t("register")}
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/72 md:text-base">
                {t("registerDescription")}
              </p>
            </div>

            <div className="max-w-md rounded-[1.8rem] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <Hotel className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("accessPanelTitle")}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/58">
                    {t("registerPanelLabel")}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/68">{t("demoHint")}</p>
              <Link
                href="/disclaimer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white"
              >
                {t("reviewDisclaimer")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
