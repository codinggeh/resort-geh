# ResortsGeh

Demo booking vila yang rapi untuk kebutuhan portofolio.

ResortsGeh menampilkan pengalaman resort publik yang terasa masuk akal, lengkap dengan alur customer bilingual, data booking seed, dan area admin untuk inventaris, booking, serta role pengguna. Permukaan produknya memang fiktif, tetapi implementasinya benar-benar berjalan.

## Isi proyek

- Halaman publik untuk jelajah vila, detail vila, dan flow booking
- Lokalisasi Inggris dan Indonesia dengan navigasi yang sadar locale
- Auth email/password dengan role guest, admin, dan super-admin
- Dashboard admin untuk vila, booking, dan pengguna
- Database SQLite lokal dengan konten demo yang sudah di-seed
- Halaman disclaimer publik yang menjelaskan cakupan fiktifnya

## Framing portofolio

Repository ini disusun agar aman dipajang di publik:

- Brand hospitality dan seluruh listing bersifat fiktif
- Data booking, pembayaran, dan ulasan adalah konten demo hasil seed
- Foto properti dari Unsplash dipakai untuk presentasi visual
- Aplikasi tetap berjalan seperti full-stack app sungguhan saat dijalankan lokal

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

## Setup lokal

### 1. Install dependency

```bash
npm install
```

### 2. Siapkan environment variable

```bash
cp .env.example .env.local
```

Variabel yang dibutuhkan:

| Variable | Fungsi |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL canonical untuk metadata |
| `NEXT_PUBLIC_APP_URL` | Fallback URL sisi client |
| `BETTER_AUTH_URL` | Base URL Better Auth |
| `BETTER_AUTH_SECRET` | Secret untuk signing auth |

### 3. Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`.

Jalur paling cepat dengan state demo yang bersih:

```bash
npm install
cp .env.example .env.local
npm run db:reset
npm run dev
```

## Data seed

Repository ini sudah menyertakan snapshot `sqlite.db` supaya UI langsung bisa dipakai.

Kalau ingin membangun ulang database secara manual:

```bash
npx drizzle-kit push
npx tsx src/db/seed.ts
```

Akun demo setelah seed:

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@resortsgeh.test` | `password123` |
| Admin | `admin@resortsgeh.test` | `password123` |
| Guest | `guest@resortsgeh.test` | `password123` |

## Script

| Command | Deskripsi |
| --- | --- |
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build untuk production |
| `npm run start` | Menjalankan server hasil build |
| `npm run lint` | Menjalankan ESLint |
| `npm run check` | Menjalankan lint dan production build |
| `npm run db:push` | Push perubahan schema |
| `npm run db:seed` | Seed ulang database lokal |
| `npm run db:reset` | Bangun ulang schema dan seed ulang data demo |

## Catatan

- `sqlite.db-shm` dan `sqlite.db-wal` sengaja di-ignore dan tidak boleh ikut ter-commit.
- Halaman disclaimer di dalam aplikasi menjelaskan framing bisnis fiktifnya.
- Kalau dipasang publik, tetap isi environment variable dengan nilai yang benar dan pertahankan route disclaimer.

## Lisensi

MIT. Lihat [LICENSE](LICENSE).
