# Lion FMS — Backend (Laravel API)

API backend untuk Lion File Management System, dibangun dengan Laravel 11 dan Laravel Sanctum (token bearer auth).

## Requirement

- PHP >= 8.2
- Composer
- PostgreSQL >= 14 (default; dapat diganti MySQL/SQLite via `DB_CONNECTION`)
- Node.js >= 20.19 (untuk build aset via Vite)

## Instalasi

```bash
composer install
cp .env.example .env
php artisan key:generate
```

## Konfigurasi Environment

Semua variabel tersedia di `.env.example`. Yang utama:

```env
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=fms_db
DB_USERNAME=postgres
DB_PASSWORD=
```

Buat database `fms_db` terlebih dahulu:

```sql
CREATE DATABASE fms_db;
```

## Migration & Seeder

```bash
php artisan migrate --seed
```

Seeder membuat dua akun default:

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@example.com` | `password` |
| Viewer | `viewer@example.com` | `password` |

## Menjalankan Server

```bash
php artisan serve
```

API tersedia di `http://localhost:8000/api/v1`.

## Ringkasan API

Autentikasi menggunakan bearer token dari `POST /api/v1/login`. Role `administrator` mendapat akses penuh; `viewer` hanya read-only.

| Endpoint | Method | Akses |
|---|---|---|
| `/api/v1/login` | POST | Public |
| `/api/v1/logout`, `/api/v1/me` | POST, GET | Auth |
| `/api/v1/folders`, `/folders/{id}` | GET | Auth |
| `/api/v1/folders` (create/update/delete) | POST, PATCH, DELETE | Admin |
| `/api/v1/departments` | GET | Auth |
| `/api/v1/departments` (create/update/delete) | POST, PATCH, DELETE | Admin |
| `/api/v1/files` (+ filter, pagination, upload, download) | GET, POST, PATCH, DELETE | Auth / Admin |
| `/api/v1/dashboard` | GET | Admin |

Dokumentasi lengkap: [`../api-contract.md`](../api-contract.md).

## Testing

```bash
php artisan test
```
