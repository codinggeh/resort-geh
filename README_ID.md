# ResortsGeh

Demo booking vila yang rapi untuk kebutuhan portofolio.

[![CI](https://github.com/codinggeh/serbapremium/actions/workflows/ci.yml/badge.svg)](https://github.com/codinggeh/serbapremium/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

ResortsGeh menampilkan pengalaman resort publik yang terasa masuk akal, lengkap dengan alur customer bilingual, data booking seed, dan area admin untuk inventaris, booking, serta role pengguna. Permukaan produknya memang fiktif, tetapi implementasinya benar-benar berjalan.

> Prefer English? See [README.md](README.md).

## Isi proyek

- Halaman publik untuk jelajah vila, detail vila, dan flow booking
- Lokalisasi Inggris dan Indonesia dengan navigasi yang sadar locale
- Auth email/password dengan role guest, admin, dan super-admin
- Dashboard admin untuk vila, booking, dan pengguna
- Database SQLite lokal dengan konten demo yang sudah di-seed
- Halaman disclaimer publik yang menjelaskan cakupan fiktifnya
- Mode demo read-only untuk deployment publik yang aman

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
| `DEMO_MODE` | Isi `1` untuk menolak semua mutation di server |
| `NEXT_PUBLIC_DEMO_MODE` | Isi `1` untuk menampilkan banner demo dan autofill kredensial di halaman login |

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

## Mode demo

Mode demo menjaga deployment publik tetap aman dengan mematikan semua jalur write tanpa mengganggu pengalaman baca.

Kalau `DEMO_MODE=1`:

- Semua server action yang menulis data mengembalikan error read-only
- Sign-up email/password dimatikan lewat Better Auth
- Webhook pembayaran Pakasir menolak request dengan `503`

Kalau `NEXT_PUBLIC_DEMO_MODE=1`:

- Banner demo muncul di halaman publik maupun admin
- Halaman login menampilkan tombol autofill untuk akun seed
- Halaman register menampilkan notice read-only dan tombol submit dinonaktifkan
- Sidebar admin menampilkan badge read-only
- Percobaan mutation dari UI memunculkan toast yang sudah dilokalisasi

Aktifkan dua flag ini bersamaan untuk demo publik yang fully locked-down. Biarkan keduanya kosong (atau `0`) untuk pengembangan lokal biasa.

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
| `npm run test` | Menjalankan unit & component test (Vitest) |
| `npm run check` | Menjalankan lint dan production build |
| `npm run db:push` | Push perubahan schema |
| `npm run db:seed` | Seed ulang database lokal |
| `npm run db:reset` | Bangun ulang schema dan seed ulang data demo |

## Continuous integration

`.github/workflows/ci.yml` menjalankan lint, test, dan build di setiap push dan pull request ke `main`. Badge hijau di atas README ini mencerminkan run terakhir di branch default.

## Deploy ke Vercel

Snapshot `sqlite.db` yang sudah di-commit ikut kebawa ke bundle Next.js, dan mode demo memastikan runtime berjalan read-only sehingga filesystem Vercel yang ephemeral tidak pernah ditulisi.

1. Push repository ini ke GitHub.
2. Import ke Vercel dan pilih preset Next.js. Build dan install command diambil dari `vercel.json`.
3. Tambahkan environment variable berikut (Production dan Preview):

   | Variable | Nilai |
   | --- | --- |
   | `BETTER_AUTH_SECRET` | String acak yang panjang |
   | `BETTER_AUTH_URL` | URL deployment Vercel kamu |
   | `NEXT_PUBLIC_SITE_URL` | URL deployment Vercel kamu |
   | `NEXT_PUBLIC_APP_URL` | URL deployment Vercel kamu |
   | `DEMO_MODE` | `1` |
   | `NEXT_PUBLIC_DEMO_MODE` | `1` |

4. Deploy. `next.config.ts` menambahkan `sqlite.db` ke bundle serverless function lewat `outputFileTracingIncludes`, dan `src/db/index.ts` membuka file dalam mode SQLite read-only ketika demo mode aktif.

Karena filesystem Vercel direset di setiap cold start, data seed menjadi satu-satunya sumber di production. Jalankan `npm run db:reset` di lokal kalau mau memperbarui snapshot yang di-commit sebelum push ulang.

## Kontribusi

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan setup lokal, checklist sebelum PR, dan catatan gaya kode.

## Catatan

- `sqlite.db-shm` dan `sqlite.db-wal` sengaja di-ignore dan tidak boleh ikut ter-commit.
- Halaman disclaimer di dalam aplikasi menjelaskan framing bisnis fiktifnya.
- Kalau dipasang publik, isi environment variable dengan nilai yang benar, aktifkan dua flag demo mode, dan pertahankan route disclaimer.

## Lisensi

MIT. Lihat [LICENSE](LICENSE).
