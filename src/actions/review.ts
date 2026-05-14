"use server";

import { db } from "@/db";
import { reviews, bookings, villas } from "@/db/schema";
import { getAuthSession } from "@/lib/session";
import { reviewSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { revalidateLocalizedPaths } from "@/lib/revalidate";
import { isDemoModeEnabled } from "@/lib/demo-mode";

export async function createReview(formData: {
  villaId: string;
  rating: number;
  comment: string;
}) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  if (isDemoModeEnabled()) {
    return { error: { villaId: ["DEMO_MODE_READ_ONLY"] } };
  }

  const parsed = reviewSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const completedBooking = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.villaId, parsed.data.villaId),
      eq(bookings.guestId, session.user.id),
      eq(bookings.status, "COMPLETED")
    ),
  });

  if (!completedBooking) {
    return {
      error: {
        villaId: ["You can only review villas where you've completed a stay"],
      },
    };
  }

  const existingReview = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.villaId, parsed.data.villaId),
      eq(reviews.guestId, session.user.id)
    ),
  });

  if (existingReview) {
    return { error: { villaId: ["You've already reviewed this villa"] } };
  }

  try {
    await db.insert(reviews).values({
      id: uuid(),
      villaId: parsed.data.villaId,
      guestId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("reviews.villa_id") &&
      error.message.includes("reviews.guest_id")
    ) {
      return { error: { villaId: ["You've already reviewed this villa"] } };
    }

    throw error;
  }

  const villa = await db.query.villas.findFirst({
    where: eq(villas.id, parsed.data.villaId),
    columns: {
      slug: true,
    },
  });

  revalidateLocalizedPaths([
    "/villas",
    ...(villa?.slug ? [`/villas/${villa.slug}`] : []),
  ]);
  return { success: true };
}
