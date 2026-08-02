# Growth Hub KMS (Knowledge Management System)

Growth Hub KMS adalah platform Manajemen Pengetahuan Terintegrasi (*Knowledge Management System*) berbasis web yang dirancang untuk mengelola, memverifikasi, dan mendistribusikan pengetahuan serta dokumen serah terima (*handover*) di seluruh divisi perusahaan secara realtime.

---

## Daftar Isi
- [Fitur Utama](#fitur-utama)
- [Arsitektur & Keamanan Visibilitas](#arsitektur--keamanan-visibilitas)
- [Teknologi Utama](#teknologi-utama)
- [Struktur Proyek](#struktur-proyek)
- [Panduan Instalasi & Penggunaan](#panduan-instalasi--penggunaan)
- [Konfigurasi Supabase](#konfigurasi-supabase)
- [Skema Database](#skema-database)
- [Pengujian & Verifikasi](#pengujian--verifikasi)

---

## Fitur Utama

### 1. Knowledge Base (Pusat Pengetahuan Perusahaan)
- **Akses Company-Wide**: Dokumen dan artikel pengetahuan yang telah disetujui (*approved*) oleh Manajer divisi dapat diakses oleh seluruh anggota perusahaan.
- **Kategori & Pencarian**: Filter artikel berdasarkan kategori divisi (Graphic Design, IT, HR, Marketing, Finance, dll.) dan pencarian teks penuh.
- **Statistik Interaksi**: Pelacakan jumlah tayangan (*views*) dan unduhan (*downloads*) artikel.

### 2. Handover Rotasi (Role-Based Visibility)
- **Visibilitas Berbasis Role Uploader (`authorRole`)**:
  - Dokumen handover yang diunggah oleh Manajer **hanya dapat dilihat oleh sesama Manajer** dari divisi manapun. Karyawan/Associate di divisi yang sama tidak memiliki akses ke dokumen Manajer.
  - Dokumen handover yang diunggah oleh Karyawan/Associate **hanya dapat dilihat oleh sesama Karyawan/Associate**.
  - **Akses Khusus Admin**: Pengguna dengan role Admin dapat melihat seluruh dokumen handover rotasi dari semua role.
- **Filter Pencarian & Periode**: Pengfilteran berdasarkan pencarian nama dokumen, divisi, dan periode rotasi.

### 3. Verifikasi Konten (Approval Workflow)
- **Pengajuan Dokumen**: Karyawan dapat mengunggah draf dokumen ke antrean verifikasi.
- **Notifikasi Peninjauan**: Manajer divisi terkait menerima notifikasi verifikasi secara otomatis.
- **Approval & Rejection**:
  - Jika **Disetujui**: Artikel otomatis masuk ke Knowledge Base dan notifikasi dipublikasikan ke seluruh pengguna di perusahaan.
  - Jika **Ditolak**: Catatan penolakan beserta alasan dari Manajer dikirimkan khusus ke uploader dokumen.

### 4. Forum Diskusi Interaktif
- **Diskusi Per Divisi**: Topik diskusi terarah sesuai dengan divisi pengguna.
- **Struktur Komentar Hierarkis (*Nested Comment Tree*)**: Pendukung balasan komentar bertingkat tanpa duplikasi.
- **Notifikasi Balasan Personal**: Pengguna menerima notifikasi langsung ketika komentar mereka dibalas oleh pengguna lain.

### 5. Sinkronisasi Realtime & Notifikasi Persisten
- **Supabase Realtime Subscriptions**: Sinkronisasi otomatis dua arah untuk tabel `knowledge_articles`, `handover_docs`, `pending_docs`, `notifications`, `forum_topics`, dan `forum_comments`.
- **Sistem Notifikasi**: Notifikasi disimpan secara persisten di database Supabase dan diperbarui secara otomatis di semua sesi yang aktif.

---

## Arsitektur & Keamanan Visibilitas

Sistem menerapkan aturan batas visibilitas dan otorisasi ketat di tingkat frontend dan backend:

| Fitur | Target Akses / Visibilitas | Penanganan Kegagalan / Fallback |
| :--- | :--- | :--- |
| **Knowledge Base** | Seluruh Pengguna Perusahaan | Auto-retry kolom inti jika schema Supabase belum di-migrate. |
| **Handover Rotasi** | Berbasis Role Uploader (`doc.authorRole === currentUser.role`), Admin (Semua) | Tampilan pesan khusus jika tidak ada dokumen sesuai role. |
| **Verifikasi Konten** | Manajer Divisi Terkait & Uploader | Notifikasi penolakan terisolasi hanya untuk uploader. |
| **Forum Diskusi** | Seluruh Anggota Divisi Terkait | Pembuatan pohon komentar hierarkis otomatis. |

---

## Teknologi Utama

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Material Symbols.
- **Backend Services**: Supabase (PostgreSQL Database, Realtime Postgres Changes, Row Level Security / RLS).
- **Pengujian**: Vitest, React Testing Library, JS-DOM.
- **State & Storage**: React Context/Hooks, LocalStorage Persistence Fallback.

---

## Struktur Proyek

```
growth-hub-kms/
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # Header navigasi & tombol Easter Egg mode tema
│   │   ├── Sidebar.tsx                # Sidebar navigasi modul
│   │   ├── views/
│   │   │   ├── DashboardView.tsx      # Ringkasan aktivitas & statistik KMS
│   │   │   ├── KnowledgeBaseView.tsx  # Halaman pusat pengetahuan perusahaan
│   │   │   ├── HandoverRotasiView.tsx # Halaman handover rotasi berbasis role
│   │   │   ├── VerifikasiKontenView.tsx # Halaman peninjauan dokumen manajer
│   │   │   ├── ForumDiskusiView.tsx   # Halaman forum diskusi & komentar bertingkat
│   │   │   ├── DataPenggunaView.tsx   # Halaman manajemen pengguna & role
│   │   │   └── LaporanPenggunaanView.tsx # Halaman statistik & laporan KMS
│   ├── lib/
│   │   └── supabase.ts                # Inisialisasi klien Supabase
│   ├── services/
│   │   └── supabaseService.ts         # Service CRUD & Realtime database
│   ├── utils/
│   │   ├── dateUtils.ts               # Helper format waktu relatif
│   │   └── ...
│   ├── types.ts                       # Interface TypeScript terpusat
│   ├── App.tsx                        # Root Application & Realtime Subscriptions
│   └── main.tsx                       # Entry point aplikasi
├── src/__tests__/                     # Unit & integration tests (Vitest)
├── supabase/                          # Schema SQL & RLS policies script
├── package.json                       # Konfigurasi dependensi proyek
└── README.md                          # Dokumentasi resmi proyek
```

---

## Panduan Instalasi & Penggunaan

### Prasyarat System
- Node.js versi 18.0.0 atau lebih baru
- npm versi 9.0.0 atau lebih baru

### 1. Kloning Repositori & Install Dependensi
```bash
git clone https://github.com/osdimm/GROWTHHUB-KMS.git
cd GROWTHHUB-KMS
npm install
```

### 2. Konfigurasi Environment Variables
Buat berkas `.env.local` pada direktori utama proyek dan tambahkan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Menjalankan Server Pengembang (Development)
```bash
npm run dev
```
Buka browser dan akses halaman `http://localhost:5173`.

### 4. Build untuk Produksi
```bash
npm run build
```
Hasil build akan tersimpan di dalam folder `dist/`.

---

## Konfigurasi Supabase

Untuk menjalankan fungsionalitas database dan realtime secara penuh, jalankan perintah SQL berikut pada **Supabase SQL Editor**:

```sql
-- 1. Tabel Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    author TEXT,
    target_user_id TEXT,
    target_user_name TEXT,
    target_division TEXT,
    target_roles TEXT[],
    exclude_uploader_name TEXT,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE
);

-- 2. Tabel Handover Docs (Termasuk author_role)
CREATE TABLE IF NOT EXISTS public.handover_docs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size TEXT NOT NULL,
    rotation_period TEXT NOT NULL,
    division TEXT NOT NULL,
    submit_date TEXT NOT NULL,
    author TEXT NOT NULL,
    author_role TEXT DEFAULT 'Karyawan',
    description TEXT,
    content_type TEXT DEFAULT 'file',
    link_url TEXT,
    file_url TEXT,
    views INT DEFAULT 0,
    downloads INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS) & Publikasi Realtime
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handover_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and write on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on handover_docs" ON public.handover_docs FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.handover_docs;
```

---

## Pengujian & Verifikasi

Proyek ini dilengkapi dengan suite pengujian otomatis berbasis **Vitest**:

```bash
# Menjalankan pengujian otomatis
npm test

# Menjalankan pemeriksaan tipe TypeScript
npx tsc --noEmit
```

---

## Lisensi

Proyek ini dikembangkan untuk penggunaan internal organisasi **Growth Hub KMS**. Seluruh hak cipta dilindungi undang-undang.
