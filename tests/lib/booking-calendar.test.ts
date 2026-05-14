import { describe, expect, it } from "vitest";
import { buildBookingIcs } from "@/lib/booking-calendar";

describe("buildBookingIcs", () => {
  const baseEvent = {
    bookingId: "abc-123",
    villaName: "Seseh Tide Villa",
    checkIn: "2026-06-10",
    checkOut: "2026-06-13",
    guestCount: 2,
    siteUrl: "https://example.com/my-bookings",
  };

  it("emits a valid VEVENT with all-day DTSTART and DTEND", () => {
    const ics = buildBookingIcs(baseEvent);

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260610");
    expect(ics).toContain("DTEND;VALUE=DATE:20260613");
    expect(ics).toContain("UID:abc-123@resortsgeh");
  });

  it("escapes commas, semicolons, and newlines in text fields", () => {
    const ics = buildBookingIcs({
      ...baseEvent,
      villaName: "Villa A; B, with\nnewline",
    });

    expect(ics).toContain("SUMMARY:Stay at Villa A\\; B\\, with\\nnewline");
  });

  it("omits URL line when site URL is missing", () => {
    const ics = buildBookingIcs({ ...baseEvent, siteUrl: undefined });

    expect(ics).not.toMatch(/^URL:/m);
  });
});
