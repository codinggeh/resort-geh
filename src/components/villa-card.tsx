"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/safe-image";
import { getSafeImageGallery } from "@/lib/image";
import { Star, Bed, Bath, Users } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/formatters";

interface VillaCardProps {
  villa: {
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
    status: string;
  };
  avgRating: number;
  reviewCount: number;
  priority?: boolean;
}

export function VillaCard({ villa, avgRating, reviewCount, priority = false }: VillaCardProps) {
  const t = useTranslations("villa");
  const locale = useLocale();
  const images = getSafeImageGallery(villa.imageUrls);

  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Link href={`/villas/${villa.slug}`}>
        <Card className="group gap-0 overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 py-0 shadow-[0_18px_48px_-28px_rgba(45,35,24,0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_70px_-30px_rgba(45,35,24,0.45)]">
          {/* Image */}
          <div className="relative h-72 overflow-hidden">
            <SafeImage
              src={images[0]}
              alt={villa.name}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
            <div className="absolute top-4 left-4">
              <Badge
                variant="secondary"
                className="rounded-full border border-white/20 bg-white/92 px-3.5 py-1 text-black shadow-sm"
              >
                {formatCurrency(villa.pricePerNight, locale)}
                <span className="font-normal text-muted-foreground ml-1">
                  /{t("perNight")}
                </span>
              </Badge>
            </div>
            {avgRating > 0 && (
              <div className="absolute top-4 right-4">
                <Badge className="rounded-full bg-stone-950/72 px-3.5 py-1 text-white backdrop-blur-sm">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {avgRating.toFixed(1)} ({reviewCount})
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-7">
            <h3 className="font-display mb-2 text-[1.9rem] leading-none tracking-[0.03em] text-foreground transition-colors group-hover:text-primary">
              {villa.name}
            </h3>
            <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {villa.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                {villa.bedrooms}
              </span>
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                {villa.bathrooms}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {villa.maxGuests}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
