"use client";

import { useMemo, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { DEFAULT_VILLA_IMAGE_SRC, resolveNextImageSource } from "@/lib/image";

type SafeImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_VILLA_IMAGE_SRC,
  unoptimized,
  onError,
  ...props
}: SafeImageProps) {
  const resolved = useMemo(
    () => resolveNextImageSource(src, fallbackSrc),
    [src, fallbackSrc]
  );

  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const isFallbackActive = failedSrc === resolved.src;
  const currentSrc = isFallbackActive ? fallbackSrc : resolved.src;
  const currentUnoptimized = isFallbackActive ? false : resolved.unoptimized;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized ?? currentUnoptimized}
      onError={(event) => {
        if (!isFallbackActive) {
          setFailedSrc(resolved.src);
        }

        onError?.(event);
      }}
    />
  );
}
