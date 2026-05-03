import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { SITE_URL } from "@/lib/constants/site";

const isDevelopment = process.env.NODE_ENV === "development";

if (!process.env.BETTER_AUTH_SECRET && !isDevelopment) {
  throw new Error("BETTER_AUTH_SECRET must be set outside development");
}

const authSecret =
  process.env.BETTER_AUTH_SECRET ||
  "resorts-geh-development-secret-change-this-in-production";

const trustedOrigins = [
  SITE_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.1.21:3000",
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []),
];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || SITE_URL,
  trustedOrigins,
  secret: authSecret,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "GUEST",
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
