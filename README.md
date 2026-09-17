# Lion FMS — File Management System

## Deskripsi Project

Lion FMS adalah aplikasi **File Management System (FMS)** full-stack untuk mengelola dokumen perusahaan berdasarkan struktur folder dan departemen. Fitur utama:

- **Manajemen Folder** — struktur folder bertingkat (recursive tree) dengan aturan anti-circular hierarchy
- **Manajemen File** — upload file hingga 10 MB (pdf, doc, docx, xls, xlsx, png, jpg, jpeg), edit metadata, dan download
- **Manajemen Departemen** — CRUD departemen untuk kategorisasi file
- **Dashboard** — statistik ringkas (total folder, file, departemen) dan daftar file terbaru
- **Role & Access Control** — dua role:
  - `administrator` — akses penuh (CRUD + dashboard)
  - `viewer` — hanya dapat melihat (read-only)

## Arsitektur

| Bagian | Teknologi | Lokasi |
|---|---|---|
| Backend API | Laravel 11 + Sanctum (token auth), PostgreSQL | [`backend/`](./backend) |
| Frontend | Vue 3 + TypeScript + Vite, Pinia, TanStack Query, Tailwind CSS | [`frontend/`](./frontend) |

Detail kontrak API tersedia di [`api-contract.md`](./api-contract.md).

## Requirement

- PHP >= 8.2
- Composer
- PostgreSQL >= 14 (atau MySQL/SQLite sesuai konfigurasi)
- Node.js >= 20.19
- npm

## Struktur Repository

```
lion/
├── backend/            # API Laravel (Sanctum, migrasi, seeder)
├── frontend/           # SPA Vue 3 + TypeScript
├── api-contract.md     # Dokumentasi kontrak API v1
├── lion-postman.json   # Koleksi API untuk Postman
└── lion-hoppscotch.json # Koleksi API untuk Hoppscotch
```

## Cara Instalasi

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### 2. Frontend

```bash
cd frontend
npm install
```

## Konfigurasi Environment

### Backend (`backend/.env`)

Salin dari `.env.example`, lalu sesuaikan koneksi database:

```env
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=fms_db
DB_USERNAME=postgres
DB_PASSWORD=
```

Buat database `fms_db` terlebih dahulu di PostgreSQL:

```sql
CREATE DATABASE fms_db;
```

### Frontend (`frontend/.env`)

Salin dari `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Cara Menjalankan Migration & Seeder

Jalankan dari direktori `backend/`:

```bash
php artisan migrate --seed
```

Seeder akan membuat dua akun default (lihat bagian Akun Login di bawah).

## Cara Menjalankan Project

### Backend (API server di port 8000)

```bash
cd backend
php artisan serve
```

### Frontend (dev server di port 5173)

```bash
cd frontend
npm run dev
```

Buka `http://localhost:5173` di browser.

> Frontend berkomunikasi dengan backend melalui `VITE_API_BASE_URL` (default `http://localhost:8000`), jadi backend harus berjalan terlebih dahulu.

## Pengujian API (Postman / Hoppscotch)

Koleksi semua endpoint API tersedia dalam dua format di root repository:

| File | Untuk | Format |
|---|---|---|
| `lion-postman.json` | Postman | Postman Collection v2.1 |
| `lion-hoppscotch.json` | Hoppscotch | Hoppscotch collection |

### Postman

1. Buka Postman → **File → Import** (atau drag file ke jendela Import).
2. Pilih `lion-postman.json`.
3. Variable `baseUrl` sudah terisi `http://localhost:8000/api/v1` secara default. Jika host/port berbeda, ubah di tab **Variables** koleksi.
4. Jalankan request **login** (folder `auth`) terlebih dahulu. Script test-nya otomatis menyimpan token ke variable `accessToken`, sehingga semua request lain yang memakai header `Authorization: Bearer {{accessToken}}` langsung berfungsi.
5. Untuk **upload file** (`POST /files`), buka tab **Body → form-data** dan pilih file pada field `file`.
6. Untuk **download file**, gunakan **Save Response → Save to file** untuk menyimpan hasil binary-nya.

### Hoppscotch

1. Buka Hoppscotch (web atau desktop) → Collections → **Import** → *Import from Hoppscotch*, pilih `lion-hoppscotch.json`.
2. Buat **environment** dengan variable `BASE_URL=http://localhost:8000/api/v1`, lalu aktifkan environment tersebut (koleksi memakai placeholder `<<BASE_URL>>`).
3. Jalankan request **login** terlebih dahulu — script test-nya menyimpan `ACCESS_TOKEN` ke environment, yang dipakai request lain sebagai `Bearer <<ACCESS_TOKEN>>`.

> Catatan: file Hoppscotch juga bisa diimpor ke Postman melalui **Import → Migrate to Postman → Other**, namun placeholder `<<...>>` perlu disesuaikan setelah migrasi. Untuk Postman, gunakan `lion-postman.json` agar langsung berfungsi.

## Akun Login

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@example.com` | `password` |
| Viewer | `viewer@example.com` | `password` |
