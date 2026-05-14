import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as sqliteSchema from "@/db/schema";
import * as pgSchema from "@/db/schema.pg";
import { SITE_URL } from "@/lib/constants/site";
import { isDemoModeEnabled } from "@/lib/demo-mode";

const isDevelopment = process.env.NODE_ENV === "development";
const isPostgres = !!process.env.DATABASE_URL;
const schema = isPostgres ? pgSchema : sqliteSchema;

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
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.VERCEL_BRANCH_URL ? [`https://${process.env.VERCEL_BRANCH_URL}`] : []),
  ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []),
];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || SITE_URL,
  trustedOrigins,
  secret: authSecret,
  database: drizzleAdapter(db, {
    provider: isPostgres ? "pg" : "sqlite",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: isDemoModeEnabled(),
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
