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
├── backend/          # API Laravel (Sanctum, migrasi, seeder)
├── frontend/         # SPA Vue 3 + TypeScript
└── api-contract.md   # Dokumentasi kontrak API v1
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

## Akun Login

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@example.com` | `password` |
| Viewer | `viewer@example.com` | `password` |
