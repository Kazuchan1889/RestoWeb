# Ratatouille — Sistem Manajemen Antrean Restoran

Aplikasi manajemen antrean dan alokasi meja restoran berbasis web interaktif yang dibangun menggunakan **Laravel 12**, **React + Vite**, **Tailwind CSS**, dan **PostgreSQL**.

---

## Deskripsi Aplikasi

**Ratatouille** membantu staf dan *waiter* restoran dalam mengelola kedatangan pelanggan, antrean menunggu, serta penempatan meja secara *real-time*. Aplikasi ini dilengkapi dengan denah meja visual interaktif, fitur *drag-and-drop* untuk alokasi meja, pengukur waktu durasi makan (*countdown timer*), antrean prioritas, dan pencatatan riwayat sesi makan.

---

## Fitur Utama

- **Denah Meja Real-Time**: Visualisasi tata letak meja dengan indikator status (*Kosong*, *Sedang Makan*, *Dibersihkan*).
- **Drag & Drop Penempatan Meja**: Geser tiket kedatangan atau antrean pelanggan langsung ke meja kosong yang sesuai dengan kapasitas.
- **Antrean Prioritas (Priority Queue)**: Mengurutkan antrean berdasarkan jumlah rombongan terbesar untuk mengoptimalkan penggunaan kapasitas meja restoran.
- **Timer Penghitung Waktu Durasi Makan**: Timer penghitung mundur secara *real-time* untuk memantau sisa waktu makan di setiap meja.
- **Riwayat Sesi Makan (Dining History)**: Pencatatan riwayat sesi makan pelanggan yang telah selesai dengan fitur pencarian, filter, dan paginasi.
- **Desain Ramah Touchscreen POS**: Antarmuka yang dioptimalkan untuk input cepat oleh staf restoran pada perangkat POS.

---

## Aturan Alokasi Meja

- **Kapasitas Meja**:
  - Meja A: 2 Kursi
  - Meja B: 4 Kursi
  - Meja C: 6 Kursi
  - Meja D: 8 Kursi
- **Penempatan Otomatis**: Pelanggan dialokasikan secara otomatis ke meja kosong terkecil yang muat menampung jumlah rombongan.
- **Rumus Durasi Makan**: `(jumlah_rombongan × 15) + random(5 sampai 15)` menit.
- **Pindah Meja & Penempatan Manual**: Staf dapat memindahkan pelanggan antar meja atau menempatkan antrean secara manual via *drag-and-drop*.

---

## Teknologi yang Digunakan

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 18, Vite, Tailwind CSS
- **Database**: PostgreSQL (Supabase Cloud / Lokal)
- **HTTP Client**: Axios

---

## Panduan Instalasi & Pengembangan Lokal

### 1. Prasyarat Sistem
- PHP versi 8.2 atau lebih baru & Composer
- Node.js versi 18 atau lebih baru & NPM
- Database PostgreSQL (atau SQLite untuk uji coba cepat)

### 2. Langkah Instalasi

```bash
# Clone repositori proyek
git clone https://github.com/Kazuchan1889/RestoWeb.git
cd RestoWeb

# Install dependensi PHP
composer install

# Install dependensi Node.js
npm install

# Salin file konfigurasi lingkungan
cp .env.example .env

# Generate application key
php artisan key:generate

# Jalankan migrasi database dan seed data awal meja
php artisan migrate:fresh --seed
```

### 3. Menjalankan Server Lokal

Jalankan backend Laravel dan frontend Vite secara bersamaan dengan satu perintah:

```bash
npm run dev
```

Aplikasi dapat diakses di browser melalui alamat: `http://localhost:8000`.

---

## Pengujian Sistem (Testing)

Jalankan pengujian unit dan fitur backend serta frontend:

```bash
# Pengujian Backend (PHPUnit)
php artisan test

# Pengujian Frontend (Vitest)
npm run test
```

---

## Kompilasi & Deployment Production

Untuk mengompilasi aset frontend produksi:

```bash
npm run build
```

Proyek ini telah dilengkapi dengan entrypoint `api/index.php` dan file konfigurasi `vercel.json` untuk deployment Serverless Function di Vercel.

---

## Struktur Proyek

```
├── app/
│   ├── Http/Controllers/Api/QueueController.php
│   ├── Models/
│   │   ├── RestaurantTable.php
│   │   ├── Queue.php
│   │   └── DiningSession.php
│   └── Services/QueueService.php
├── bootstrap/
│   ├── app.php
│   └── providers.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── TableSeeder.php
├── public/
│   └── Ratatulii.png               # Logo & Icon Aplikasi Ratatouille
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── App.jsx
│   │   │   ├── ArrivalForm.jsx
│   │   │   ├── HistoryTable.jsx
│   │   │   ├── LiveTimer.jsx
│   │   │   ├── QueueList.jsx
│   │   │   └── RestaurantGrid.jsx
│   │   └── app.jsx
│   └── views/app.blade.php
├── routes/web.php
├── vercel.json
└── vite.config.js
```

---

## Lisensi

Lisensi MIT.
