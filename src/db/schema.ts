import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── Enums (as const arrays for Zod reuse) ────────────────────────────────────

export const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "GUEST"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const VILLA_STATUSES = ["AVAILABLE", "MAINTENANCE", "HIDDEN"] as const;
export type VillaStatus = (typeof VILLA_STATUSES)[number];

export const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_METHODS = ["CREDIT_CARD", "BANK_TRANSFER", "PAYPAL"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ─── Users ─────────────────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: text("role", { enum: USER_ROLES }).notNull().default("GUEST"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ─── Better Auth Session Table ─────────────────────────────────────────────────

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ─── Better Auth Account Table ─────────────────────────────────────────────────

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ─── Better Auth Verification Table ────────────────────────────────────────────

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: text("updated_at")
    .$defaultFn(() => new Date().toISOString()),
});

// ─── Villas ────────────────────────────────────────────────────────────────────

export const villas = sqliteTable("villas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  pricePerNight: real("price_per_night").notNull(),
  maxGuests: integer("max_guests").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  amenities: text("amenities", { mode: "json" }).notNull().$type<string[]>(),
  imageUrls: text("image_urls", { mode: "json" }).notNull().$type<string[]>(),
  status: text("status", { enum: VILLA_STATUSES }).notNull().default("AVAILABLE"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ─── Bookings ──────────────────────────────────────────────────────────────────

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  villaId: text("villa_id")
    .notNull()
    .references(() => villas.id, { onDelete: "cascade" }),
  guestId: text("guest_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  checkInDate: text("check_in_date").notNull(),
  checkOutDate: text("check_out_date").notNull(),
  guestCount: integer("guest_count").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status", { enum: BOOKING_STATUSES }).notNull().default("PENDING"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ─── Payments ──────────────────────────────────────────────────────────────────

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method", { enum: PAYMENT_METHODS }).notNull(),
  transactionId: text("transaction_id").notNull().unique(),
  status: text("status", { enum: PAYMENT_STATUSES }).notNull().default("UNPAID"),
  processedAt: text("processed_at"),
});

// ─── Reviews ───────────────────────────────────────────────────────────────────

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    villaId: text("villa_id")
      .notNull()
      .references(() => villas.id, { onDelete: "cascade" }),
    guestId: text("guest_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [uniqueIndex("reviews_villa_guest_unique").on(table.villaId, table.guestId)]
);

// ─── Relations ─────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const villasRelations = relations(villas, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  villa: one(villas, { fields: [bookings.villaId], references: [villas.id] }),
  guest: one(users, { fields: [bookings.guestId], references: [users.id] }),
  payment: one(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  villa: one(villas, { fields: [reviews.villaId], references: [villas.id] }),
  guest: one(users, { fields: [reviews.guestId], references: [users.id] }),
}));
