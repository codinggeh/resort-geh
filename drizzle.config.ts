import type { Config } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL;

const config: Config = DATABASE_URL
  ? {
      schema: "./src/db/schema.pg.ts",
      out: "./drizzle-pg",
      dialect: "postgresql",
      dbCredentials: {
        url: DATABASE_URL,
      },
    }
  : {
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dialect: "sqlite",
      dbCredentials: {
        url: "./sqlite.db",
      },
    };

export default config satisfies Config;
