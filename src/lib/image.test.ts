import { describe, expect, it } from "vitest";
import {
  DEFAULT_VILLA_IMAGE_SRC,
  getSafeImageGallery,
  resolveNextImageSource,
} from "@/lib/image";

describe("image helpers", () => {
  it("falls back for empty or malformed image values", () => {
    expect(resolveNextImageSource(undefined)).toEqual({
      src: DEFAULT_VILLA_IMAGE_SRC,
      unoptimized: false,
    });

    expect(resolveNextImageSource("not-a-url")).toEqual({
      src: DEFAULT_VILLA_IMAGE_SRC,
      unoptimized: false,
    });
  });

  it("keeps known optimized hosts optimized", () => {
    expect(
      resolveNextImageSource("https://images.unsplash.com/photo-123")
    ).toEqual({
      src: "https://images.unsplash.com/photo-123",
      unoptimized: false,
    });
  });

  it("allows unknown remote hosts without crashing next/image optimization", () => {
    expect(resolveNextImageSource("http://sdadas.cp")).toEqual({
      src: "http://sdadas.cp",
      unoptimized: true,
    });
  });

  it("ensures gallery always has at least one renderable image", () => {
    expect(getSafeImageGallery([])).toEqual([DEFAULT_VILLA_IMAGE_SRC]);
    expect(getSafeImageGallery(["https://example.com/a.jpg"])).toEqual([
      "https://example.com/a.jpg",
    ]);
  });
});
