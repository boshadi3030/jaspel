# JASPEL - Enterprise Incentive & KPI System

Sistem manajemen insentif dan KPI berbasis framework P1, P2, P3 dengan isolasi data ketat menggunakan Row Level Security (RLS).

**Status: Production Ready ✅** - Sistem telah di-rebuild dengan perbaikan menyeluruh pada authentication, navigation, error handling, dan performance.

## 🎯 Fitur Utama

### 1. Authentication & Session Management
- Login/logout yang stabil tanpa loop
- Session management yang reliable dengan auto-refresh
- Error handling yang jelas dengan pesan Bahasa Indonesia
- Protected routes dengan middleware

### 2. Keamanan & Hak Akses (RBAC + RLS)
- **Superadmin**: Akses penuh untuk mengelola master data (Unit, Karyawan, Indikator KPI, Bobot Global)
- **Unit Manager**: Mengelola realisasi KPI untuk karyawan di unitnya (tidak bisa melihat unit lain)
- **Employee**: Melihat dashboard pencapaian pribadi dan unduh slip insentif PDF

### 3. User Interface
- Semua teks dalam Bahasa Indonesia
- Format angka dan tanggal sesuai konvensi Indonesia
- Toast notifications untuk feedback
- Error boundaries untuk stability
- Loading states yang jelas
- Responsive design

### 4. Struktur KPI (P1, P2, P3)
- **P1 (Position)**: Indikator berbasis job desk/posisi (Fixed Performance)
- **P2 (Performance)**: Indikator berbasis target output/hasil kerja (Variable)
- **P3 (Potential/Behavior)**: Indikator berbasis kompetensi, perilaku, atau disiplin

### 3. Kalkulasi Finansial Presisi Tinggi
- Menggunakan **Decimal.js** untuk perhitungan akurat
- Pool Dana → Alokasi Global → Proporsi Unit → Distribusi Individual
- Perhitungan PPh 21 otomatis dengan metode TER

### 4. Formula Perhitungan

#### Skor Individu
```
Skor Individu = (W_p1 × Skor_P1) + (W_p2 × Skor_P2) + (W_p3 × Skor_P3)
```

#### Skor Akhir Total
```
Skor Akhir = (W_unit × Skor_Unit) + (W_indiv × Skor_Individu)
```

#### Distribusi Dana
```
Net Pool = Penerimaan - Pengurang
Dana Dibagi = Net Pool × % Alokasi Global
Dana Unit = Dana Dibagi × % Proporsi Unit
Insentif Individual = Dana Unit × (Skor Karyawan / Total Skor Unit)
```

## 🏗️ Arsitektur Teknologi

- **Framework**: Next.js 15 (App Router) dengan Server Components
- **Database**: Supabase (PostgreSQL + RLS)
- **Authentication**: Supabase Auth dengan @supabase/ssr
- **UI**: Shadcn UI + Tailwind CSS
- **Notifications**: Sonner (toast notifications)
- **Kalkulasi**: Decimal.js (presisi tinggi)
- **PDF**: jsPDF + jsPDF-AutoTable
- **Excel**: XLSX
- **Icons**: Lucide React

### Performance Optimizations
- Server Components by default
- Optimized bundle size untuk Vercel free tier
- Data caching dengan TTL
- Lazy loading untuk komponen berat
- Optimized imports (lucide-react, Supabase)

## 🔐 Authentication Flow

The system uses Supabase Auth native features for simple, reliable authentication:

### Login Process
1. User enters email and password
2. System calls `supabase.auth.signInWithPassword()`
3. Supabase creates and manages session automatically
4. System fetches user data from `m_employees` table
5. User redirected to role-based dashboard

### Session Management
- Sessions are automatically managed by Supabase
- Tokens are automatically refreshed before expiration
- Sessions persist across browser refreshes
- No custom JWT handling required

### Protected Routes
- Middleware validates session using `supabase.auth.getSession()`
- Invalid sessions redirect to login page
- No custom session validation logic

### Logout
- System calls `supabase.auth.signOut()`
- Supabase clears all session data automatically
- User redirected to login page

## 🚀 Quick Start

Lihat [INSTALL.md](./INSTALL.md) untuk panduan instalasi lengkap.

### Ringkasan Cepat

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.local.example .env.local
# Edit .env.local dengan Supabase credentials

# 3. Apply database schema
# Copy supabase/schema.sql ke Supabase SQL Editor dan execute

# 4. Create superadmin user
npm run setup:auth

# 5. Run development server
npm run dev
```

Buka http://localhost:3000 dan login dengan kredensial superadmin.

## 📚 Dokumentasi

- **[INSTALL.md](./INSTALL.md)** - Panduan instalasi lengkap
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Setup database dan schema
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Panduan deployment ke production
- **[API.md](./API.md)** - API documentation
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview
- **[REBUILD_COMPLETE.md](./REBUILD_COMPLETE.md)** - Status rebuild dan changelog

## 📁 Struktur Folder

```
jaspel-kpi-system/
├── app/
│   ├── admin/dashboard/          # Dashboard Superadmin
│   ├── manager/dashboard/        # Dashboard Unit Manager
│   ├── employee/dashboard/       # Dashboard Employee
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                       # Shadcn UI components
├── lib/
│   ├── formulas/
│   │   └── kpi-calculator.ts     # Core calculation logic
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── types/
│   │   └── database.types.ts     # TypeScript types
│   └── utils.ts
├── services/
│   └── calculation.service.ts    # Business logic layer
├── supabase/
│   └── schema.sql                # Database schema + RLS policies
├── .env.local.example
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Instalasi & Setup

Lihat [INSTALL.md](./INSTALL.md) untuk panduan lengkap.

Ringkasan:
1. Clone repository dan install dependencies
2. Setup Supabase project dan apply schema
3. Configure environment variables
4. Create superadmin user
5. Run development server

## 📊 Database Schema

### Master Tables
- `m_units`: Unit kerja/organisasi
- `m_employees`: Data karyawan
- `m_kpi_categories`: Kategori KPI (P1, P2, P3) per unit
- `m_kpi_indicators`: Indikator detail per kategori

### Transaction Tables
- `t_pool`: Pool dana per periode
- `t_pool_revenue`: Detail penerimaan
- `t_pool_deduction`: Detail pengurang
- `t_realization`: Realisasi KPI per karyawan
- `t_individual_scores`: Skor individu (P1, P2, P3)
- `t_unit_scores`: Skor unit
- `t_calculation_results`: Hasil kalkulasi final (audit trail)

## 🔐 Row Level Security (RLS)

Semua tabel dilindungi dengan RLS policies:

### Superadmin
- Akses penuh ke semua tabel

### Unit Manager
- Hanya bisa melihat dan mengelola data karyawan di unitnya
- Tidak bisa melihat data unit lain

### Employee
- Hanya bisa melihat data pribadi
- Tidak bisa melihat data karyawan lain

## 🧮 Penggunaan Calculation Service

```typescript
import { runFullCalculation } from '@/services/calculation.service'

// Jalankan kalkulasi untuk periode tertentu
const result = await runFullCalculation('2024-03')
```

## 📝 Workflow Operasional

### 1. Setup Awal (Superadmin)
1. Buat Unit kerja
2. Tambah Karyawan
3. Konfigurasi KPI Categories (P1, P2, P3) per unit
4. Tambah Indikator KPI per kategori
5. Set bobot untuk setiap kategori dan indikator

### 2. Input Realisasi (Unit Manager)
1. Pilih periode
2. Input realisasi KPI untuk setiap karyawan
3. Sistem otomatis menghitung achievement percentage

### 3. Kalkulasi & Distribusi (Superadmin)
1. Buat Pool Dana untuk periode
2. Input penerimaan dan pengurang
3. Set alokasi global percentage
4. Jalankan kalkulasi
5. Review hasil
6. Approve dan distribute

### 4. Lihat Hasil (Employee)
1. Login ke dashboard
2. Lihat breakdown P1, P2, P3
3. Lihat insentif bruto, pajak, dan netto
4. Download slip PDF

## 🎨 UI/UX Features

- Dashboard modern dengan Shadcn UI
- Grafik radar untuk perbandingan P1, P2, P3
- Tabel dengan filter dan sorting
- Export ke Excel dan PDF
- Responsive design

## 🔧 Development

### Build untuk Production
```bash
npm run build
```

### Deploy ke Vercel
```bash
vercel deploy
```

## 📄 License

Proprietary - All rights reserved

## 👥 Support

Untuk pertanyaan dan dukungan, hubungi tim development.
