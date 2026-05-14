/* eslint-disable @typescript-eslint/no-require-imports */
import { isDemoModeEnabled } from "@/lib/demo-mode";

const DATABASE_URL = process.env.DATABASE_URL;

function createDb() {
  if (DATABASE_URL) {
    // Neon Postgres (serverless)
    const { neon } = require("@neondatabase/serverless") as typeof import("@neondatabase/serverless");
    const { drizzle } = require("drizzle-orm/neon-http") as typeof import("drizzle-orm/neon-http");
    const schema = require("./schema.pg") as typeof import("./schema.pg");

    const sql = neon(DATABASE_URL);
    return drizzle(sql, { schema });
  }

  // SQLite (local development)
  const { drizzle } = require("drizzle-orm/better-sqlite3") as typeof import("drizzle-orm/better-sqlite3");
  const Database = require("better-sqlite3") as typeof import("better-sqlite3");
  const path = require("path") as typeof import("path");
  const schema = require("./schema") as typeof import("./schema");

  const DB_PATH = path.join(process.cwd(), "sqlite.db");
  const readOnly = isDemoModeEnabled();

  const sqlite = new Database(DB_PATH, readOnly ? { readonly: true, fileMustExist: true } : {});

  if (!readOnly) {
    sqlite.pragma("journal_mode = DELETE");
    sqlite.pragma("foreign_keys = ON");
  } else {
    sqlite.pragma("query_only = ON");
  }

  return drizzle(sqlite, { schema });
}

export const db = createDb() as any;
export type DB = typeof db;

