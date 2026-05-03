"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { createVilla, updateVilla } from "@/actions/admin";
import { type FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { villaSchema, type VillaFormData } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import {
  findFirstErrorMessage,
  parseAmenitiesInput,
  parseImageUrlsInput,
  parseNumberInput,
} from "@/lib/admin-villa-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

type VillaStatus = "AVAILABLE" | "MAINTENANCE" | "HIDDEN";

interface VillaFormProps {
  mode: "create" | "edit";
  villa?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    imageUrls: string[];
    status: VillaStatus;
  };
}

type VillaFormState = Omit<
  VillaFormData,
  "pricePerNight" | "maxGuests" | "bedrooms" | "bathrooms" | "status"
> & {
  pricePerNight?: number;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: VillaStatus;
};

function RequiredLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      <span className="text-destructive">*</span>
    </Label>
  );
}

export function VillaForm({ mode, villa }: VillaFormProps) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const initialValues: VillaFormState = useMemo(
    () => ({
      name: villa?.name ?? "",
      slug: villa?.slug ?? "",
      description: villa?.description ?? "",
      pricePerNight: villa?.pricePerNight,
      maxGuests: villa?.maxGuests,
      bedrooms: villa?.bedrooms,
      bathrooms: villa?.bathrooms,
      amenities: villa?.amenities ?? [],
      imageUrls: villa?.imageUrls ?? [],
      status: villa?.status ?? "AVAILABLE",
    }),
    [villa]
  );

  const initialGeneratedSlug = useMemo(() => slugify(initialValues.name), [initialValues.name]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    mode === "edit" && initialValues.slug !== initialGeneratedSlug
  );
  const [amenitiesInput, setAmenitiesInput] = useState(initialValues.amenities.join(", "));
  const [imageUrlsInput, setImageUrlsInput] = useState(initialValues.imageUrls.join("\n"));

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<VillaFormState>({
    resolver: zodResolver(villaSchema) as never,
    defaultValues: initialValues,
    shouldFocusError: true,
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");
  const statusValue = watch("status");

  function getErrorMessage(message?: string) {
    if (!message) {
      return null;
    }

    const mappedMessages: Record<string, string> = {
      "Name must be at least 2 characters": t("validation.nameMin"),
      "Slug must be at least 2 characters": t("validation.slugMin"),
      "Slug must be lowercase alphanumeric with hyphens": t("validation.slugFormat"),
      "Description must be at least 10 characters": t("validation.descriptionMin"),
      "Invalid input: expected number, received undefined": t("validation.numberRequired"),
      "Price must be positive": t("validation.pricePositive"),
      "Must allow at least 1 guest": t("validation.maxGuestsMin"),
      "Too small: expected number to be >=0": t("validation.nonNegative"),
      "At least one amenity required": t("validation.amenitiesRequired"),
      "At least one image required": t("validation.imageUrlsRequired"),
      "Invalid URL": t("validation.imageUrlInvalid"),
      "Image URL host is not allowed": t("validation.imageUrlHostInvalid"),
      "Slug already in use": t("validation.slugTaken"),
    };

    return mappedMessages[message] ?? message;
  }

  function getFieldErrorMessage(error: unknown) {
    return getErrorMessage(findFirstErrorMessage(error) ?? undefined);
  }

  function handleNameChange(value: string) {
    setValue("name", value, { shouldDirty: true, shouldValidate: isSubmitted });

    if (!slugManuallyEdited) {
      setValue("slug", slugify(value), { shouldDirty: true, shouldValidate: isSubmitted });
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setValue("slug", slugify(value), { shouldDirty: true, shouldValidate: isSubmitted });
  }

  async function onSubmit(data: VillaFormState) {
    setLoading(true);
    try {
      const result =
        mode === "edit" && villa
          ? await updateVilla(villa.id, data as VillaFormData)
          : await createVilla(data as VillaFormData);

      if ("error" in result && result.error) {
        const messages = Object.values(result.error).flat();
        toast.error(getErrorMessage(messages[0]) || t("operationFailed"));
        return;
      }

      toast.success(mode === "edit" ? t("villaUpdated") : t("villaCreated"));
      router.push("/admin/villas");
      router.refresh();
    } catch {
      toast.error(t("somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  function onInvalid(formErrors: FieldErrors<VillaFormState>) {
    const firstError = findFirstErrorMessage(formErrors);
    toast.error(getErrorMessage(firstError ?? undefined) || t("fixFormErrors"));
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="rounded-full">
          <Link href="/admin/villas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToVillas")}
          </Link>
        </Button>
      </div>

      <Card className="rounded-[2rem] border-border/70 bg-card/90 shadow-[0_24px_70px_-40px_rgba(45,35,24,0.35)]">
        <CardHeader className="border-b border-border/70 pb-6">
          <CardTitle className="font-display text-3xl tracking-[0.03em]">
            {mode === "edit" ? t("editVilla") : t("addVilla")}
          </CardTitle>
          <CardDescription>
            {mode === "edit" ? t("editVillaDialogDescription") : t("addVillaDialogDescription")}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel htmlFor="name">{t("name")}</RequiredLabel>
                <Input
                  id="name"
                  value={nameValue}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Villa Sunset Paradise"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{getFieldErrorMessage(errors.name)}</p>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="slug">{t("slug")}</RequiredLabel>
                <Input
                  id="slug"
                  value={slugValue}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  placeholder="villa-sunset-paradise"
                />
                <p className="text-xs text-muted-foreground">{t("slugHint")}</p>
                {errors.slug && (
                  <p className="text-xs text-destructive">{getFieldErrorMessage(errors.slug)}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="description">{t("description")}</RequiredLabel>
              <Textarea
                id="description"
                value={watch("description")}
                onChange={(event) =>
                  setValue("description", event.target.value, {
                    shouldDirty: true,
                    shouldValidate: isSubmitted,
                  })
                }
                rows={4}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{getFieldErrorMessage(errors.description)}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <RequiredLabel htmlFor="pricePerNight">{t("pricePerNight")} ($)</RequiredLabel>
                <Input
                  id="pricePerNight"
                  type="number"
                  step="0.01"
                  value={watch("pricePerNight") ?? ""}
                  onChange={(event) =>
                    setValue("pricePerNight", parseNumberInput(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: isSubmitted,
                    })
                  }
                />
                {errors.pricePerNight && (
                  <p className="text-xs text-destructive">{getFieldErrorMessage(errors.pricePerNight)}</p>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="maxGuests">{t("maxGuests")}</RequiredLabel>
                <Input
                  id="maxGuests"
                  type="number"
                  value={watch("maxGuests") ?? ""}
                  onChange={(event) =>
                    setValue("maxGuests", parseNumberInput(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: isSubmitted,
                    })
                  }
                />
                {errors.maxGuests && (
                  <p className="text-xs text-destructive">{getFieldErrorMessage(errors.maxGuests)}</p>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="bedrooms">{t("bedrooms")}</RequiredLabel>
                <Input
                  id="bedrooms"
                  type="number"
                  value={watch("bedrooms") ?? ""}
                  onChange={(event) =>
                    setValue("bedrooms", parseNumberInput(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: isSubmitted,
                    })
                  }
                />
                {errors.bedrooms && (
                  <p className="text-xs text-destructive">{getFieldErrorMessage(errors.bedrooms)}</p>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="bathrooms">{t("bathrooms")}</RequiredLabel>
                <Input
                  id="bathrooms"
                  type="number"
                  value={watch("bathrooms") ?? ""}
                  onChange={(event) =>
                    setValue("bathrooms", parseNumberInput(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: isSubmitted,
                    })
                  }
                />
                {errors.bathrooms && (
                  <p className="text-xs text-destructive">{getFieldErrorMessage(errors.bathrooms)}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <RequiredLabel>{t("villaStatus")}</RequiredLabel>
              <Select
                value={statusValue}
                onValueChange={(value) =>
                  setValue("status", value as VillaStatus, {
                    shouldDirty: true,
                    shouldValidate: isSubmitted,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">{t("available")}</SelectItem>
                  <SelectItem value="MAINTENANCE">{t("maintenance")}</SelectItem>
                  <SelectItem value="HIDDEN">{t("hidden")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive">{getFieldErrorMessage(errors.status)}</p>
              )}
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="amenities">{t("amenities")}</RequiredLabel>
              <Input
                id="amenities"
                value={amenitiesInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setAmenitiesInput(nextValue);
                  setValue("amenities", parseAmenitiesInput(nextValue), {
                    shouldDirty: true,
                    shouldValidate: isSubmitted,
                  });
                }}
                placeholder="wifi, pool, kitchen"
              />
              {errors.amenities && (
                <p className="text-xs text-destructive">{getFieldErrorMessage(errors.amenities)}</p>
              )}
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="imageUrls">{t("imageUrls")}</RequiredLabel>
              <Textarea
                id="imageUrls"
                value={imageUrlsInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setImageUrlsInput(nextValue);
                  setValue("imageUrls", parseImageUrlsInput(nextValue), {
                    shouldDirty: true,
                    shouldValidate: isSubmitted,
                  });
                }}
                rows={5}
                placeholder="https://images.unsplash.com/..."
              />
              {errors.imageUrls && (
                <p className="text-xs text-destructive">{getFieldErrorMessage(errors.imageUrls)}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/villas">{tc("cancel")}</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "edit" ? t("updateVilla") : t("createVilla")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
