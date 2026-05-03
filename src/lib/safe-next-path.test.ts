import { describe, expect, it } from "vitest";

import { getSafeNextPath } from "./safe-next-path";

describe("getSafeNextPath", () => {
  it("returns the fallback for empty values", () => {
    expect(getSafeNextPath(undefined, "/admin")).toBe("/admin");
    expect(getSafeNextPath(null, "/admin")).toBe("/admin");
    expect(getSafeNextPath("", "/admin")).toBe("/admin");
  });

  it("accepts internal paths with query and hash", () => {
    expect(getSafeNextPath("/admin?month=4&year=2026#chart")).toBe(
      "/admin?month=4&year=2026#chart"
    );
  });

  it("rejects absolute external urls and protocol-relative values", () => {
    expect(getSafeNextPath("https://evil.example/steal", "/")).toBe("/");
    expect(getSafeNextPath("//evil.example/steal", "/")).toBe("/");
  });

  it("rejects malformed non-path values", () => {
    expect(getSafeNextPath("javascript:alert(1)", "/")).toBe("/");
    expect(getSafeNextPath("admin", "/")).toBe("/");
  });
});
