import { z } from "zod";
import {
  USER_ROLES,
  VILLA_STATUSES,
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
} from "@/db/schema";
import { isAllowedVillaImageUrl } from "@/lib/image";

const PUBLIC_BOOKING_PAYMENT_METHODS = ["CREDIT_CARD", "BANK_TRANSFER"] as const;

// ─── Villa Schemas ─────────────────────────────────────────────────────────────

export const villaSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pricePerNight: z.number().positive("Price must be positive"),
  maxGuests: z.number().int().min(1, "Must allow at least 1 guest"),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  amenities: z.array(z.string()).min(1, "At least one amenity required"),
  imageUrls: z
    .array(
      z
        .string()
        .url()
        .refine(isAllowedVillaImageUrl, "Image URL host is not allowed")
    )
    .min(1, "At least one image required"),
  status: z.enum(VILLA_STATUSES),
});

export type VillaFormData = z.infer<typeof villaSchema>;

// ─── Booking Schemas ───────────────────────────────────────────────────────────

export const bookingSchema = z
  .object({
    villaId: z.string().min(1, "Villa is required"),
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    guestCount: z.number().int().min(1, "At least 1 guest required"),
    paymentMethod: z.enum(PUBLIC_BOOKING_PAYMENT_METHODS),
  })
  .refine(
    (data) => new Date(data.checkOutDate) > new Date(data.checkInDate),
    { message: "Check-out must be after check-in", path: ["checkOutDate"] }
  );

export type BookingFormData = z.infer<typeof bookingSchema>;

// ─── Review Schema ─────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  villaId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// ─── Auth Schemas ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Admin Schemas ─────────────────────────────────────────────────────────────

export const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(BOOKING_STATUSES),
});

export const updatePaymentStatusSchema = z.object({
  bookingId: z.string().min(1),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  bookingStatus: z.enum(BOOKING_STATUSES),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(USER_ROLES),
});
