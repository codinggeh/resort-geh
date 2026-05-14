interface BookingCalendarEvent {
  bookingId: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  siteUrl?: string;
}

function formatIcsDate(isoDate: string) {
  return isoDate.replace(/-/g, "");
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function buildBookingIcs({
  bookingId,
  villaName,
  checkIn,
  checkOut,
  guestCount,
  siteUrl,
}: BookingCalendarEvent) {
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const summary = escapeIcsText(`Stay at ${villaName}`);
  const description = escapeIcsText(
    [
      `Booking reference: ${bookingId}`,
      `Guests: ${guestCount}`,
      siteUrl ? `Manage booking: ${siteUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ResortsGeh//Booking Confirmation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${bookingId}@resortsgeh`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${formatIcsDate(checkIn)}`,
    `DTEND;VALUE=DATE:${formatIcsDate(checkOut)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    siteUrl ? `URL:${siteUrl}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadBookingIcs(event: BookingCalendarEvent, fileName?: string) {
  const content = buildBookingIcs(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName ?? `resortsgeh-booking-${event.bookingId.slice(0, 8)}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
