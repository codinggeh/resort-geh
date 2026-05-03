# ResortsGeh

A polished villa-booking demo built for portfolio review.

ResortsGeh presents a believable public resort experience with a bilingual customer flow, seeded booking data, and an admin area for inventory, bookings, and user roles. The product surface is intentionally fictional, while the implementation is real.

## What is included

- Public villa browsing, detail pages, and booking flow
- English and Indonesian localization with locale-aware navigation
- Email/password auth with guest, admin, and super-admin roles
- Admin dashboard for villas, bookings, and users
- Local SQLite database with seeded demo content
- Public disclaimer page explaining the fictional scope

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
| `npm run check` | Run lint and production build |
| `npm run db:push` | Push schema changes |
| `npm run db:seed` | Re-seed the local database |
| `npm run db:reset` | Rebuild schema and re-seed demo data |

## Notes

- `sqlite.db-shm` and `sqlite.db-wal` are intentionally ignored and should not be committed.
- The disclaimer page in the app explains the fictional business framing.
- If you deploy publicly, set real environment values and keep the disclaimer route available.

## License

MIT. See [LICENSE](LICENSE).
