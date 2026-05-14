# ResortsGeh

A polished villa-booking demo built for portfolio review.

[![CI](https://github.com/codinggeh/serbapremium/actions/workflows/ci.yml/badge.svg)](https://github.com/codinggeh/serbapremium/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

ResortsGeh presents a believable public resort experience with a bilingual customer flow, seeded booking data, and an admin area for inventory, bookings, and user roles. The product surface is intentionally fictional, while the implementation is real.

> Prefer Bahasa Indonesia? Lihat [README_ID.md](README_ID.md).

## What is included

- Public villa browsing, detail pages, and booking flow
- English and Indonesian localization with locale-aware navigation
- Email/password auth with guest, admin, and super-admin roles
- Admin dashboard for villas, bookings, and users
- Local SQLite database with seeded demo content
- Public disclaimer page explaining the fictional scope
- Read-only demo mode for safe public deployments

## Portfolio framing

This repository is designed to be safe to showcase publicly:

- The hospitality brand and listings are fictional
- Booking, payment, and review data are seeded demo content
- Unsplash property photography is used for presentation only
- The product still behaves like a real full-stack app locally

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- next-intl
- Better Auth
- Drizzle ORM
- SQLite
- Shadcn UI / Radix primitives
- Framer Motion
- Recharts

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used by metadata |
| `NEXT_PUBLIC_APP_URL` | Client-side app URL fallback |
| `BETTER_AUTH_URL` | Better Auth base URL |
| `BETTER_AUTH_SECRET` | Auth signing secret |
| `DEMO_MODE` | Set to `1` to reject every mutation server-side |
| `NEXT_PUBLIC_DEMO_MODE` | Set to `1` to show the demo banner and login credential hints |

### 3. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

Fastest path with a clean demo state:

```bash
npm install
cp .env.example .env.local
npm run db:reset
npm run dev
```

## Demo mode

Demo mode keeps a public deployment safe by disabling every write path while leaving the read experience fully interactive.

When `DEMO_MODE=1`:

- All server actions that mutate data return a read-only error
- Email/password sign-up is disabled via Better Auth
- The Pakasir payment webhook rejects incoming requests with `503`

When `NEXT_PUBLIC_DEMO_MODE=1`:

- A demo banner appears on every public and admin page
- The login page shows one-click credential autofill for seeded accounts
- The register page shows a read-only notice and disables the submit button
- The admin sidebar shows a read-only badge
- Mutation attempts from the UI surface a localized toast

Pair both flags for a fully locked-down public demo. Leave both unset (or `0`) for normal local development.

## Seed data

The repository includes a seeded `sqlite.db` snapshot so the UI works immediately.

If you want to rebuild the database manually:

```bash
npx drizzle-kit push
npx tsx src/db/seed.ts
```

Demo accounts after seeding:

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@resortsgeh.test` | `password123` |
| Admin | `admin@resortsgeh.test` | `password123` |
| Guest | `guest@resortsgeh.test` | `password123` |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local development |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit and component tests |
| `npm run check` | Run lint and production build |
| `npm run db:push` | Push schema changes |
| `npm run db:seed` | Re-seed the local database |
| `npm run db:reset` | Rebuild schema and re-seed demo data |

## Continuous integration

`.github/workflows/ci.yml` runs lint, test, and build on every push and pull request against `main`. A green badge at the top of this README reflects the latest run on the default branch.

## Deploying to Vercel

The committed `sqlite.db` snapshot ships with the Next.js build, and demo mode keeps the runtime read-only so Vercel's ephemeral filesystem is never written to.

1. Push this repository to GitHub.
2. Import it into Vercel and pick the Next.js preset. Build and install commands come from `vercel.json`.
3. Add the following environment variables (Production and Preview):

   | Variable | Value |
   | --- | --- |
   | `BETTER_AUTH_SECRET` | A long random string |
   | `BETTER_AUTH_URL` | Your Vercel deployment URL |
   | `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL |
   | `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |
   | `DEMO_MODE` | `1` |
   | `NEXT_PUBLIC_DEMO_MODE` | `1` |

4. Deploy. `next.config.ts` adds `sqlite.db` to the serverless function bundle via `outputFileTracingIncludes`, and `src/db/index.ts` opens the file in SQLite read-only mode whenever demo mode is active.

Because the filesystem is reset on every cold start, the seeded data is the source of truth on Vercel. Run `npm run db:reset` locally if you want to refresh the committed snapshot before pushing.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, required checks, and code style notes.

## Notes

- `sqlite.db-shm` and `sqlite.db-wal` are intentionally ignored and should not be committed.
- The disclaimer page in the app explains the fictional business framing.
- If you deploy publicly, set real environment values, enable both demo mode flags, and keep the disclaimer route available.

## License

MIT. See [LICENSE](LICENSE).
