# Lion FMS — Frontend (Vue 3 + TypeScript)

SPA frontend untuk Lion File Management System, dibangun dengan Vue 3, TypeScript, Vite, Pinia, TanStack Query, dan Tailwind CSS.

## Requirement

- Node.js >= 20.19
- npm

## Instalasi

```bash
npm install
```

## Konfigurasi Environment

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi variabel:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Nilai ini dipakai sebagai base URL API pada `src/shared/api/client.ts` (endpoint lengkap: `{VITE_API_BASE_URL}/api/v1`). Pastikan backend Laravel sudah berjalan di alamat tersebut.

## Menjalankan Project

```bash
npm run dev
```

Aplikasi tersedia di `http://localhost:5173`.

## Build Produksi

```bash
npm run build    # type-check (vue-tsc) + build ke dist/
npm run preview  # preview hasil build
```

## Struktur

- `src/shared/api/` — klien axios, interceptor token, tipe error
- `src/env.d.ts` — tipe untuk variabel `import.meta.env`

## Akun Login

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@example.com` | `password` |
| Viewer | `viewer@example.com` | `password` |
