import { describe, expect, it } from "vitest";
import {
  findFirstErrorMessage,
  parseAmenitiesInput,
  parseImageUrlsInput,
  parseNumberInput,
} from "@/lib/admin-villa-form";

describe("admin-villa-form helpers", () => {
  it("parseAmenitiesInput trims and removes empty items", () => {
    expect(parseAmenitiesInput("wifi, pool, , kitchen ")).toEqual([
      "wifi",
      "pool",
      "kitchen",
    ]);
  });

  it("parseImageUrlsInput splits newline-delimited urls", () => {
    expect(parseImageUrlsInput("https://a.com\n\n https://b.com ")).toEqual([
      "https://a.com",
      "https://b.com",
    ]);
  });

  it("parseNumberInput returns undefined for empty input", () => {
    expect(parseNumberInput("")).toBeUndefined();
    expect(parseNumberInput("   ")).toBeUndefined();
  });

  it("parseNumberInput parses numeric strings", () => {
    expect(parseNumberInput("120")).toBe(120);
    expect(parseNumberInput("120.5")).toBe(120.5);
  });

  it("findFirstErrorMessage resolves nested array-like field errors", () => {
    const nestedError = {
      imageUrls: {
        0: {
          message: "Invalid URL",
        },
      },
    };

    expect(findFirstErrorMessage(nestedError)).toBe("Invalid URL");
  });

  it("findFirstErrorMessage resolves root-level field errors", () => {
    const rootError = {
      message: "At least one image required",
    };

    expect(findFirstErrorMessage(rootError)).toBe("At least one image required");
  });
});
