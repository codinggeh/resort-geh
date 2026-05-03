function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const FALLBACK_SITE_URL = "http://localhost:3000";
const resolvedSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  FALLBACK_SITE_URL;

export const SITE_CONFIG = {
  name: "ResortsGeh",
  tagline: "Private villa stays with a quieter, more considered pace.",
  description:
    "A premium villa booking demo with a public browsing flow, role-based admin tools, and bilingual support.",
  url: stripTrailingSlash(resolvedSiteUrl),
  developer: {
    name: "Coding Geh",
    url: "https://codinggeh.com",
    socials: {
      github: "https://github.com/codinggeh",
    },
  },
  testAccounts: [
    {
      role: "Super Admin",
      email: "superadmin@resortsgeh.test",
      password: "password123",
    },
    {
      role: "Admin",
      email: "admin@resortsgeh.test",
      password: "password123",
    },
    {
      role: "Guest",
      email: "guest@resortsgeh.test",
      password: "password123",
    },
  ],
} as const;

export const SITE_URL = SITE_CONFIG.url;
