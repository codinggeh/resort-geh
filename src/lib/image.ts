export const DEFAULT_VILLA_IMAGE_SRC = "/placeholder-villa.svg";

export const ALLOWED_VILLA_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "res.cloudinary.com",
]);

export function resolveNextImageSource(
  src?: string | null,
  fallbackSrc = DEFAULT_VILLA_IMAGE_SRC
) {
  if (!src) {
    return { src: fallbackSrc, unoptimized: false };
  }

  if (src.startsWith("/")) {
    return { src, unoptimized: false };
  }

  try {
    const url = new URL(src);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { src: fallbackSrc, unoptimized: false };
    }

    return {
      src,
      unoptimized: !ALLOWED_VILLA_IMAGE_HOSTS.has(url.hostname),
    };
  } catch {
    return { src: fallbackSrc, unoptimized: false };
  }
}

export function getSafeImageGallery(
  imageUrls: string[] | null | undefined,
  fallbackSrc = DEFAULT_VILLA_IMAGE_SRC
) {
  const urls = imageUrls?.filter(Boolean) ?? [];
  return urls.length > 0 ? urls : [fallbackSrc];
}

export function isAllowedVillaImageUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      ALLOWED_VILLA_IMAGE_HOSTS.has(url.hostname)
    );
  } catch {
    return false;
  }
}
