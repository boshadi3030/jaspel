# Dokumentasi Aplikasi JASPEL KPI System

**Versi:** 1.0  
**Tanggal:** 9 Maret 2026  
**Status:** Production Ready

---

## 1. RINGKASAN EKSEKUTIF

JASPEL adalah sistem manajemen insentif dan KPI berbasis web untuk organisasi Indonesia. Sistem ini mengelola pelacakan kinerja karyawan dan distribusi insentif menggunakan framework KPI tiga tingkat (P1, P2, P3).

### Teknologi Utama
- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Backend:** Supabase (PostgreSQL + Auth)
- **UI:** Shadcn UI + Tailwind CSS
- **Deployment:** Vercel (Free Tier)

### Fitur Utama
- ✅ Autentikasi berbasis Supabase Auth
- ✅ Row Level Security (RLS) untuk isolasi data antar unit
- ✅ Kalkulasi finansial presisi tinggi (Decimal.js)
- ✅ Perhitungan PPh 21 otomatis
- ✅ Import/Export Excel
- ✅ Generate PDF slip insentif
- ✅ Dashboard real-time dengan visualisasi

---

## 2. ARSITEKTUR SISTEM

### 2.1 Struktur Direktori

```
jaspel-kpi-system/
├── app/                    # Next.js App Router
│   ├── admin/             # Halaman Superadmin
│   ├── manager/           # Halaman Unit Manager
│   ├── employee/          # Halaman Employee
│   ├── api/               # API Routes (minimal)
│   ├── login/             # Halaman Login
│   └── profile/           # Halaman Profile
├── components/            # React Components
│   ├── kpi/              # Komponen KPI
│   ├── pool/             # Komponen Pool
│   ├── units/            # Komponen Unit
│   ├── users/            # Komponen User
│   ├── pegawai/          # Komponen Pegawai
│   ├── realization/      # Komponen Realisasi
│   ├── navigation/       # Sidebar & Navigation
│   └── ui/               # Shadcn UI Components
├── lib/                   # Core Libraries
│   ├── supabase/         # Supabase Clients
│   ├── services/         # Business Logic Services
│   ├── hooks/            # React Hooks
│   ├── formulas/         # KPI Calculator
│   ├── export/           # Excel & PDF Export
│   └── utils/            # Utilities
├── supabase/             # Database
│   ├── schema.sql        # Full Schema + RLS
│   ├── seed.sql          # Sample Data
│   └── migrations/       # Database Migrations
└── scripts/              # Utility Scripts
```

### 2.2 Alur Data

```
User Request
    ↓
Middleware (Auth Check)
    ↓
Next.js App Router
    ↓
Server Components / Server Actions
    ↓
Service Layer (lib/services/)
    ↓
Supabase Client (RLS Applied)
    ↓
PostgreSQL Database
```

---

## 3. ROLE & PERMISSION

### 3.1 Superadmin
**Akses:** Semua fitur sistem

**Menu:**
- Dashboard (statistik global)
- Manajemen Unit
- Manajemen User
- Manajemen Pegawai
- Konfigurasi KPI
- Manajemen Pool
- Laporan
- Audit Log
- Pengaturan Sistem

**Kemampuan:**
- CRUD semua master data
- Konfigurasi struktur KPI
- Buat dan kelola pool bulanan
- Jalankan kalkulasi insentif
- Generate laporan
- Lihat audit log
- Ubah pengaturan sistem

### 3.2 Unit Manager
**Akses:** Data unit sendiri saja (RLS enforced)

**Menu:**
- Dashboard (statistik unit)
- Input Realisasi KPI

**Kemampuan:**
- Lihat daftar pegawai di unit sendiri
- Input realisasi KPI pegawai
- Lihat dashboard performa unit

### 3.3 Employee
**Akses:** Data pribadi saja

**Menu:**
- Dashboard (performa pribadi)

**Kemampuan:**
- Lihat dashboard pribadi
- Download slip insentif
- Lihat riwayat insentif

---

## 4. DATABASE SCHEMA

### 4.1 Tabel Master (m_*)

#### m_unit
Unit organisasi
```sql
- id: uuid (PK)
- kode_unit: varchar(50) UNIQUE
- nama_unit: varchar(255)
- created_at, updated_at
```

#### m_pegawai
Data pegawai (terpisah dari auth.users)
```sql
- id: uuid (PK)
- user_id: uuid (FK → auth.users) NULLABLE
- unit_id: uuid (FK → m_unit)
- nip: varchar(50) UNIQUE
- nama: varchar(255)
- jabatan: varchar(255)
- status: enum('aktif', 'nonaktif')
- created_at, updated_at
```

#### m_kpi_category
Kategori KPI (P1/P2/P3)
```sql
- id: uuid (PK)
- unit_id: uuid (FK → m_unit)
- nama_kategori: varchar(255)
- bobot: decimal(5,2)
- urutan: integer
```

#### m_kpi_indicator
Indikator KPI
```sql
- id: uuid (PK)
- category_id: uuid (FK → m_kpi_category)
- nama_indikator: text
- satuan: varchar(50)
- target: decimal(15,2)
- bobot: decimal(5,2)
- urutan: integer
```

### 4.2 Tabel Transaksi (t_*)

#### t_pool
Pool insentif bulanan
```sql
- id: uuid (PK)
- unit_id: uuid (FK → m_unit)
- bulan: integer (1-12)
- tahun: integer
- jumlah_pool: decimal(15,2)
- status: enum('draft', 'active', 'calculated')
```

#### t_realization
Realisasi KPI pegawai
```sql
- id: uuid (PK)
- pool_id: uuid (FK → t_pool)
- pegawai_id: uuid (FK → m_pegawai)
- indicator_id: uuid (FK → m_kpi_indicator)
- realisasi: decimal(15,2)
- skor: decimal(5,2)
```

#### t_incentive
Hasil kalkulasi insentif
```sql
- id: uuid (PK)
- pool_id: uuid (FK → t_pool)
- pegawai_id: uuid (FK → m_pegawai)
- total_skor: decimal(10,2)
- persentase: decimal(5,2)
- jumlah_bruto: decimal(15,2)
- pph21: decimal(15,2)
- jumlah_netto: decimal(15,2)
```

### 4.3 Tabel Sistem

#### t_audit_log
Log aktivitas sistem
```sql
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- action: varchar(100)
- table_name: varchar(100)
- record_id: uuid
- old_values, new_values: jsonb
- ip_address: varchar(45)
- user_agent: text
- created_at
```

#### t_notification
Notifikasi user
```sql
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- title: varchar(255)
- message: text
- type: enum('info', 'success', 'warning', 'error')
- is_read: boolean
- created_at
```

#### t_system_settings
Pengaturan sistem
```sql
- id: uuid (PK)
- key: varchar(100) UNIQUE
- value: text
- description: text
- updated_at, updated_by
```

---

## 5. AUTENTIKASI & KEAMANAN

### 5.1 Supabase Auth
- Menggunakan `@supabase/ssr` untuk server-side auth
- Session disimpan di cookies (secure, httpOnly)
- Middleware refresh token otomatis

### 5.2 Row Level Security (RLS)

**Prinsip:**
- Superadmin: Akses semua data
- Manager: Hanya data unit sendiri
- Employee: Hanya data pribadi

**Implementasi:**
```sql
-- Contoh RLS Policy untuk m_pegawai
CREATE POLICY "Superadmin full access"
ON m_pegawai FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'superadmin'
  )
);

CREATE POLICY "Manager unit access"
ON m_pegawai FOR SELECT
TO authenticated
USING (
  unit_id IN (
    SELECT unit_id FROM m_pegawai
    WHERE user_id = auth.uid()
  )
);
```

### 5.3 Middleware Protection
File: `middleware.ts`
- Cek session di setiap request
- Redirect ke /login jika tidak authenticated
- Refresh token otomatis
- Protected routes: /admin/*, /manager/*, /employee/*

---

## 6. BUSINESS LOGIC

### 6.1 Kalkulasi KPI

**Formula Skor Indikator:**
```
Skor = (Realisasi / Target) × Bobot Indikator
```

**Formula Skor Kategori:**
```
Skor Kategori = Σ(Skor Indikator) × Bobot Kategori
```

**Formula Total Skor:**
```
Total Skor = Skor P1 + Skor P2 + Skor P3
```

**Implementasi:**
- File: `lib/formulas/kpi-calculator.ts`
- Menggunakan `Decimal.js` untuk presisi tinggi
- Tidak boleh menggunakan JavaScript native number

### 6.2 Distribusi Insentif

**Formula:**
```
Persentase = (Total Skor Pegawai / Σ Total Skor Semua Pegawai) × 100%
Jumlah Bruto = Pool × Persentase
PPh 21 = Jumlah Bruto × 5%
Jumlah Netto = Jumlah Bruto - PPh 21
```

**Implementasi:**
- File: `services/calculation.service.ts`
- Batch calculation untuk semua pegawai dalam pool
- Atomic transaction (rollback jika error)

### 6.3 Perhitungan PPh 21
- Rate tetap: 5% dari bruto
- Dapat dikonfigurasi via system settings
- Otomatis terapkan saat kalkulasi

---

## 7. FITUR UTAMA

### 7.1 Manajemen KPI
**Lokasi:** `/admin/kpi-config`

**Fitur:**
- Tree view struktur KPI (kategori → indikator)
- Drag & drop untuk urutan
- CRUD kategori dan indikator
- Copy struktur antar unit
- Validasi bobot (total harus 100%)

**Komponen:**
- `components/kpi/KPITree.tsx`
- `components/kpi/CategoryFormDialog.tsx`
- `components/kpi/IndicatorFormDialog.tsx`
- `components/kpi/CopyStructureDialog.tsx`

### 7.2 Manajemen Pool
**Lokasi:** `/admin/pool`

**Fitur:**
- Buat pool bulanan per unit
- Set jumlah pool (Rupiah)
- Status: draft → active → calculated
- Lihat detail distribusi
- Recalculate jika perlu

**Komponen:**
- `components/pool/PoolTable.tsx`
- `components/pool/PoolFormDialog.tsx`
- `components/pool/PoolDetailsDialog.tsx`

### 7.3 Input Realisasi
**Lokasi:** `/manager/realization`

**Fitur:**
- Pilih pool aktif
- Pilih pegawai di unit
- Input realisasi per indikator
- Auto-calculate skor
- Validasi input (tidak boleh negatif)

**Komponen:**
- `components/realization/RealizationForm.tsx`

### 7.4 Dashboard
**Lokasi:** `/admin/dashboard`, `/manager/dashboard`, `/employee/dashboard`

**Fitur:**
- Statistik real-time
- Chart performa (Recharts)
- Top performers
- Trend bulanan
- Quick actions

### 7.5 Laporan
**Lokasi:** `/admin/reports`

**Fitur:**
- Generate laporan Excel
- Generate PDF slip insentif
- Filter by unit, bulan, tahun
- Bulk download

**Implementasi:**
- Excel: `lib/export/excel-export.ts` (XLSX)
- PDF: `lib/export/pdf-export.ts` (jsPDF)

### 7.6 Import/Export
**API:** `/api/import/realization`, `/api/import/template`

**Fitur:**
- Download template Excel
- Upload bulk realisasi
- Validasi data
- Error reporting

### 7.7 Audit Log
**Lokasi:** `/admin/audit`

**Fitur:**
- Log semua aktivitas CRUD
- Filter by user, action, table
- Detail old/new values
- IP address & user agent tracking

**Service:** `lib/services/audit.service.ts`

### 7.8 Notifikasi
**Lokasi:** `/notifications`

**Fitur:**
- Real-time notifications
- Mark as read
- Filter by type
- Auto-dismiss

**Service:** `lib/services/notification.service.ts`

---

## 8. SERVICES LAYER

### 8.1 auth.service.ts
- `signIn()`: Login dengan email/password
- `signOut()`: Logout
- `getCurrentUser()`: Get user session
- `updatePassword()`: Ubah password

### 8.2 user.service.ts
- `getUsers()`: List users dengan filter
- `createUser()`: Buat user baru (Supabase Auth)
- `updateUser()`: Update user data
- `deleteUser()`: Soft delete user

### 8.3 pegawai.service.ts
- `getPegawai()`: List pegawai dengan filter
- `createPegawai()`: Buat pegawai baru
- `updatePegawai()`: Update pegawai
- `linkUserToPegawai()`: Link user ke pegawai
- `unlinkUserFromPegawai()`: Unlink user dari pegawai

### 8.4 rbac.service.ts
- `checkPermission()`: Cek permission user
- `hasRole()`: Cek role user
- `canAccessUnit()`: Cek akses ke unit

### 8.5 audit.service.ts
- `logAction()`: Catat aktivitas
- `getAuditLogs()`: Ambil audit logs

### 8.6 notification.service.ts
- `createNotification()`: Buat notifikasi
- `getNotifications()`: Ambil notifikasi user
- `markAsRead()`: Tandai sudah dibaca

### 8.7 settings.service.ts
- `getSetting()`: Ambil setting by key
- `updateSetting()`: Update setting
- `getFooterText()`: Ambil teks footer

---

## 9. HOOKS

### 9.1 useAuth
**File:** `lib/hooks/useAuth.ts`

**Return:**
- `user`: Current user object
- `loading`: Loading state
- `signIn()`: Login function
- `signOut()`: Logout function

### 9.2 useDataCache
**File:** `lib/hooks/useDataCache.ts`

**Purpose:** Client-side caching untuk reduce API calls

**Usage:**
```typescript
const { data, loading, error, refetch } = useDataCache(
  'cache-key',
  fetchFunction,
  { ttl: 60000 } // 1 minute
);
```

### 9.3 useSearchFilter
**File:** `lib/hooks/useSearchFilter.ts`

**Purpose:** Search & filter untuk tables

**Return:**
- `searchTerm`: Current search
- `setSearchTerm()`: Update search
- `filteredData`: Filtered results

---

## 10. KOMPONEN UI

### 10.1 Shadcn UI Components
**Lokasi:** `components/ui/`

**PENTING:** Jangan modifikasi langsung!

**Komponen:**
- `button.tsx`: Button variants
- `card.tsx`: Card container
- `dialog.tsx`: Modal dialog
- `input.tsx`: Input field
- `label.tsx`: Form label
- `table.tsx`: Data table
- `tabs.tsx`: Tab navigation
- `textarea.tsx`: Textarea field
- Dan lainnya...

### 10.2 Custom Components

#### Sidebar
**File:** `components/navigation/Sidebar.tsx`

**Fitur:**
- Role-based menu
- Active state
- Collapse/expand
- Logout button

#### Footer
**File:** `components/layout/Footer.tsx`

**Fitur:**
- Dynamic text dari settings
- Copyright info

---

## 11. API ROUTES

### 11.1 /api/users/*
- `POST /api/users/create`: Buat user baru
- `PUT /api/users/update`: Update user
- `GET /api/users/list`: List users

### 11.2 /api/import/*
- `GET /api/import/template`: Download template Excel
- `POST /api/import/realization`: Upload realisasi

### 11.3 /api/reports/*
- `POST /api/reports/generate`: Generate laporan

### 11.4 /api/audit
- `GET /api/audit`: Get audit logs

### 11.5 /api/notifications
- `GET /api/notifications`: Get notifications
- `PUT /api/notifications`: Mark as read

---

## 12. ENVIRONMENT VARIABLES

**File:** `.env.local` (tidak di-commit ke git)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Optional
NEXT_PUBLIC_APP_NAME=JASPEL KPI System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 13. DEPLOYMENT

### 13.1 Vercel (Recommended)

**Setup:**
1. Push code ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy

**Config:** `next.config.js`
```javascript
module.exports = {
  output: 'standalone',
  compress: true,
  productionBrowserSourceMaps: false,
  // ... optimizations
}
```

### 13.2 Database (Supabase)

**Setup:**
1. Buat project di Supabase
2. Run `supabase/schema.sql`
3. Run migrations di `supabase/migrations/`
4. (Optional) Run `supabase/seed.sql` untuk sample data

---

## 14. TESTING & DEBUGGING

### 14.1 Scripts Testing
**Lokasi:** `scripts/`

**Contoh:**
- `test-login.ts`: Test login flow
- `test-sidebar.ts`: Test sidebar rendering
- `verify-auth-implementation.ts`: Verify auth setup

**Run:**
```bash
npx tsx scripts/test-login.ts
```

### 14.2 PowerShell Scripts
**Lokasi:** Root directory

**Contoh:**
- `TEST_APLIKASI.ps1`: Test full app
- `MULAI_DAN_TEST.ps1`: Start dev + test
- `PERBAIKI_*.ps1`: Fix scripts

**Run:**
```powershell
.\TEST_APLIKASI.ps1
```

---

## 15. BEST PRACTICES

### 15.1 Kode
- ✅ Gunakan TypeScript strict mode
- ✅ Server Components by default
- ✅ 'use client' hanya jika perlu
- ✅ Decimal.js untuk kalkulasi finansial
- ✅ Async/await untuk database calls
- ✅ Error handling dengan try-catch
- ✅ Validasi input di client & server

### 15.2 Database
- ✅ Selalu gunakan RLS policies
- ✅ Index pada foreign keys
- ✅ Gunakan transactions untuk multi-step operations
- ✅ Soft delete (status='nonaktif') daripada hard delete

### 15.3 Security
- ✅ Jangan expose service role key di client
- ✅ Validasi permission di server-side
- ✅ Sanitize user input
- ✅ Rate limiting untuk API routes
- ✅ HTTPS only di production

### 15.4 Performance
- ✅ Lazy load components
- ✅ Optimize images (Next.js Image)
- ✅ Cache data dengan useDataCache
- ✅ Minimize bundle size
- ✅ Use React.memo untuk expensive components

---

## 16. TROUBLESHOOTING

### 16.1 Login Error
**Gejala:** Redirect loop atau 404

**Solusi:**
1. Cek `.env.local` sudah benar
2. Verify user ada di `auth.users`
3. Cek RLS policies
4. Run `scripts/test-login.ts`

### 16.2 Chunk Load Error
**Gejala:** ChunkLoadError di browser

**Solusi:**
1. Clear `.next` folder
2. Rebuild: `npm run build`
3. Hard refresh browser (Ctrl+Shift+R)

### 16.3 Sidebar Tidak Muncul
**Gejala:** Sidebar blank atau error

**Solusi:**
1. Cek user role di database
2. Verify Sidebar.tsx tidak ada error
3. Run `scripts/test-sidebar.ts`

### 16.4 Kalkulasi Salah
**Gejala:** Hasil insentif tidak sesuai

**Solusi:**
1. Cek bobot kategori total = 100%
2. Cek bobot indikator per kategori total = 100%
3. Verify Decimal.js digunakan
4. Cek formula di `kpi-calculator.ts`

---

## 17. MAINTENANCE

### 17.1 Update Dependencies
```bash
npm update
npm audit fix
```

### 17.2 Database Backup
- Gunakan Supabase dashboard
- Export schema & data regular
- Simpan di version control (tanpa sensitive data)

### 17.3 Monitoring
- Vercel Analytics untuk performance
- Supabase logs untuk database
- Error tracking (optional: Sentry)

---

## 18. ROADMAP & TODO

### Selesai ✅
- Autentikasi Supabase
- RLS policies
- CRUD semua master data
- Kalkulasi KPI & insentif
- Dashboard role-based
- Import/Export Excel
- Generate PDF
- Audit log
- Notifikasi

### Dalam Progress 🚧
- UI improvements
- Performance optimization
- Error handling enhancement

### Planned 📋
- Email notifications
- Advanced reporting
- Mobile responsive improvements
- API documentation (Swagger)
- Unit testing
- E2E testing

---

## 19. KONTAK & SUPPORT

**Developer:** [Your Name]  
**Email:** [Your Email]  
**Repository:** [GitHub URL]  
**Documentation:** [Docs URL]

---

## 20. CHANGELOG

### v1.0.0 (9 Maret 2026)
- ✅ Initial release
- ✅ Core features implemented
- ✅ Production ready
- ✅ Deployed to Vercel

---

**Catatan:** Dokumentasi ini adalah snapshot dari sistem saat ini. Selalu refer ke kode terbaru untuk detail implementasi.
