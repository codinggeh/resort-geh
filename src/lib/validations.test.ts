import { describe, expect, it } from "vitest";
import { bookingSchema, villaSchema } from "@/lib/validations";

const validVillaPayload = {
  name: "Villa Sunset",
  slug: "villa-sunset",
  description: "A premium villa with sea view and private pool.",
  pricePerNight: 2500000,
  maxGuests: 6,
  bedrooms: 3,
  bathrooms: 2,
  amenities: ["wifi", "pool"],
  imageUrls: ["https://images.unsplash.com/photo-123"],
  status: "AVAILABLE" as const,
};

describe("villaSchema image validation", () => {
  it("accepts allowed image hosts", () => {
    const result = villaSchema.safeParse(validVillaPayload);
    expect(result.success).toBe(true);
  });

  it("rejects disallowed image hosts", () => {
    const result = villaSchema.safeParse({
      ...validVillaPayload,
      imageUrls: ["http://sdadas.cp"],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Image URL host is not allowed");
    }
  });
});

describe("bookingSchema payment method validation", () => {
  it("accepts supported public payment methods", () => {
    const result = bookingSchema.safeParse({
      villaId: "villa-1",
      checkInDate: "2026-05-10",
      checkOutDate: "2026-05-12",
      guestCount: 2,
      paymentMethod: "CREDIT_CARD",
    });

    expect(result.success).toBe(true);
  });

  it("rejects unsupported public payment methods", () => {
    const result = bookingSchema.safeParse({
      villaId: "villa-1",
      checkInDate: "2026-05-10",
      checkOutDate: "2026-05-12",
      guestCount: 2,
      paymentMethod: "PAYPAL",
    });

    expect(result.success).toBe(false);
  });
});
