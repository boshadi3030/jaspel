# Dokumentasi Sistem JASPEL KPI

## Daftar Isi
1. [Ringkasan Sistem](#ringkasan-sistem)
2. [Arsitektur Aplikasi](#arsitektur-aplikasi)
3. [Fitur Utama](#fitur-utama)
4. [Struktur Database](#struktur-database)
5. [Alur Bisnis](#alur-bisnis)
6. [Keamanan & RLS](#keamanan--rls)
7. [Perhitungan KPI](#perhitungan-kpi)
8. [Panduan Pengguna](#panduan-pengguna)

---

## Ringkasan Sistem

JASPEL adalah sistem manajemen insentif dan KPI berbasis web untuk organisasi Indonesia. Sistem ini mengelola pelacakan kinerja karyawan dan distribusi insentif menggunakan framework KPI tiga tingkat (P1, P2, P3).

### Teknologi Utama
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Backend**: Supabase (PostgreSQL), Server Actions
- **UI**: Shadcn UI, Tailwind CSS, Lucide Icons
- **Perhitungan**: Decimal.js (presisi tinggi untuk finansial)
- **Export**: jsPDF, XLSX

### Peran Pengguna
1. **Superadmin**: Akses penuh sistem, kelola master data, konfigurasi pool, jalankan kalkulasi
2. **Unit Manager**: Input data realisasi KPI untuk karyawan di unit mereka (isolasi data)
3. **Employee**: Lihat dashboard pribadi dan unduh slip insentif

---

## Arsitektur Aplikasi

### Struktur Direktori
```
jaspel-kpi-system/
├── app/                    # Next.js App Router
│   ├── admin/             # Halaman Superadmin
│   ├── manager/           # Halaman Unit Manager
│   ├── employee/          # Halaman Employee
│   ├── login/             # Halaman Login
│   └── api/               # API Routes (minimal)
├── components/            # Komponen React
│   ├── kpi/              # Komponen KPI
│   ├── pool/             # Komponen Pool
│   ├── units/            # Komponen Unit
│   ├── users/            # Komponen User
│   ├── navigation/       # Sidebar
│   └── ui/               # Shadcn UI
├── lib/                   # Library & Utilities
│   ├── formulas/         # Logika perhitungan KPI
│   ├── services/         # Business logic layer
│   ├── supabase/         # Supabase clients
│   ├── hooks/            # React hooks
│   └── utils/            # Utilities
├── services/              # Calculation engine
├── supabase/             # Database schema & migrations
└── scripts/              # Utility scripts
```

### Komponen Kunci

#### 1. Authentication & Authorization
- **File**: `lib/services/auth.service.ts`, `lib/services/rbac.service.ts`
- **Middleware**: `middleware.ts` (refresh session otomatis)
- **Hook**: `lib/hooks/useAuth.ts`
- Menggunakan Supabase Auth dengan Row Level Security (RLS)

#### 2. Supabase Clients
- **Browser**: `lib/supabase/client.ts` (untuk Client Components)
- **Server**: `lib/supabase/server.ts` (untuk Server Components & Actions)

#### 3. KPI Calculator
- **File**: `lib/formulas/kpi-calculator.ts`
- Menggunakan Decimal.js untuk presisi tinggi
- Menghitung skor P1, P2, P3 dan distribusi insentif

#### 4. Calculation Service
- **File**: `services/calculation.service.ts`
- Engine utama untuk kalkulasi bulanan
- Menghitung PPh 21 otomatis

---

## Fitur Utama

### 1. Manajemen Master Data (Superadmin)

#### Unit Management
- **Halaman**: `app/admin/units/page.tsx`
- **Komponen**: `components/units/UnitTable.tsx`, `UnitFormDialog.tsx`
- Fitur: CRUD unit organisasi, hirarki unit

#### User Management
- **Halaman**: `app/admin/users/page.tsx`
- **Komponen**: `components/users/UserTable.tsx`, `UserFormDialog.tsx`
- Fitur: CRUD user, assign role, reset password

### 2. Konfigurasi KPI (Superadmin)

#### KPI Structure
- **Halaman**: `app/admin/kpi-config/page.tsx`
- **Komponen**: `components/kpi/KPITree.tsx`
- Fitur:
  - Kelola kategori P1, P2, P3
  - Kelola indikator per kategori
  - Copy struktur antar unit
  - Set bobot dan target

#### Pool Management
- **Halaman**: `app/admin/pool/page.tsx`
- **Komponen**: `components/pool/PoolTable.tsx`, `PoolFormDialog.tsx`
- Fitur:
  - Buat pool bulanan per unit
  - Set jumlah insentif
  - Jalankan kalkulasi
  - Lihat detail distribusi

### 3. Input Realisasi (Unit Manager)

#### Realization Form
- **Halaman**: `app/manager/realization/page.tsx`
- **Komponen**: `components/realization/RealizationForm.tsx`
- Fitur:
  - Input realisasi per karyawan
  - Validasi data
  - Import dari Excel
  - Auto-save

### 4. Dashboard & Reports

#### Admin Dashboard
- **Halaman**: `app/admin/dashboard/page.tsx`
- Menampilkan: Total pool, distribusi, statistik sistem

#### Manager Dashboard
- **Halaman**: `app/manager/dashboard/page.tsx`
- Menampilkan: Realisasi unit, progress input

#### Employee Dashboard
- **Halaman**: `app/employee/dashboard/page.tsx`
- Menampilkan: Skor pribadi, insentif, slip PDF

### 5. Reporting & Export

#### Report Generation
- **Halaman**: `app/admin/reports/page.tsx`
- **API**: `app/api/reports/generate/route.ts`
- **Library**: `lib/export/pdf-export.ts`, `lib/export/excel-export.ts`
- Fitur:
  - Generate laporan bulanan
  - Export ke Excel/PDF
  - Slip insentif per karyawan

### 6. Audit & Notifications

#### Audit Log
- **Halaman**: `app/admin/audit/page.tsx`
- **Service**: `lib/services/audit.service.ts`
- Mencatat semua aktivitas penting

#### Notifications
- **Halaman**: `app/notifications/page.tsx`
- **Service**: `lib/services/notification.service.ts`
- Notifikasi real-time untuk user

### 7. System Settings

#### Settings Management
- **Halaman**: `app/admin/settings/page.tsx`
- **Service**: `lib/services/settings.service.ts`
- Fitur:
  - Konfigurasi footer
  - Parameter sistem
  - Pengaturan umum

---

## Struktur Database

### Master Tables (Prefix: m_)

#### m_unit
```sql
- id: uuid (PK)
- kode_unit: varchar(50) UNIQUE
- nama_unit: varchar(255)
- parent_unit_id: uuid (FK -> m_unit)
- level: int
- is_active: boolean
- created_at, updated_at
```

#### m_user
```sql
- id: uuid (PK)
- username: varchar(100) UNIQUE
- email: varchar(255) UNIQUE
- password_hash: varchar(255)
- full_name: varchar(255)
- role: enum('superadmin', 'unit_manager', 'employee')
- unit_id: uuid (FK -> m_unit)
- is_active: boolean
- created_at, updated_at
```

#### m_kpi_category
```sql
- id: uuid (PK)
- unit_id: uuid (FK -> m_unit)
- kpi_type: enum('P1', 'P2', 'P3')
- nama_kategori: varchar(255)
- bobot: decimal(5,2)
- urutan: int
- is_active: boolean
```

#### m_kpi_indicator
```sql
- id: uuid (PK)
- category_id: uuid (FK -> m_kpi_category)
- nama_indikator: varchar(255)
- satuan: varchar(50)
- target: decimal(15,2)
- bobot: decimal(5,2)
- urutan: int
- is_active: boolean
```

### Transaction Tables (Prefix: t_)

#### t_pool
```sql
- id: uuid (PK)
- unit_id: uuid (FK -> m_unit)
- bulan: int (1-12)
- tahun: int
- jumlah_insentif: decimal(15,2)
- status: enum('draft', 'calculated', 'finalized')
- calculated_at: timestamp
- created_by: uuid (FK -> m_user)
```

#### t_realization
```sql
- id: uuid (PK)
- pool_id: uuid (FK -> t_pool)
- user_id: uuid (FK -> m_user)
- indicator_id: uuid (FK -> m_kpi_indicator)
- realisasi: decimal(15,2)
- skor: decimal(5,2)
- created_at, updated_at
```

#### t_calculation_result
```sql
- id: uuid (PK)
- pool_id: uuid (FK -> t_pool)
- user_id: uuid (FK -> m_user)
- skor_p1: decimal(5,2)
- skor_p2: decimal(5,2)
- skor_p3: decimal(5,2)
- skor_total: decimal(5,2)
- insentif_bruto: decimal(15,2)
- pph21: decimal(15,2)
- insentif_netto: decimal(15,2)
```

### System Tables

#### t_audit_log
```sql
- id: uuid (PK)
- user_id: uuid (FK -> m_user)
- action: varchar(100)
- table_name: varchar(100)
- record_id: uuid
- old_values: jsonb
- new_values: jsonb
- ip_address: varchar(50)
- created_at: timestamp
```

#### t_notification
```sql
- id: uuid (PK)
- user_id: uuid (FK -> m_user)
- title: varchar(255)
- message: text
- type: enum('info', 'success', 'warning', 'error')
- is_read: boolean
- created_at: timestamp
```

#### t_system_settings
```sql
- id: uuid (PK)
- key: varchar(100) UNIQUE
- value: text
- description: text
- updated_by: uuid (FK -> m_user)
- updated_at: timestamp
```

---

## Alur Bisnis

### 1. Setup Awal (Superadmin)
```
1. Login sebagai superadmin
2. Buat struktur unit organisasi
3. Buat user (manager & employee) per unit
4. Konfigurasi struktur KPI per unit:
   - Buat kategori P1, P2, P3
   - Tambah indikator per kategori
   - Set bobot dan target
```

### 2. Periode Bulanan (Superadmin)
```
1. Buat pool bulanan untuk setiap unit
2. Set jumlah insentif per pool
3. Notifikasi ke Unit Manager untuk input realisasi
```

### 3. Input Realisasi (Unit Manager)
```
1. Login sebagai unit manager
2. Pilih periode (bulan/tahun)
3. Input realisasi per karyawan per indikator
4. Validasi dan submit data
5. (Opsional) Import dari Excel
```

### 4. Kalkulasi & Distribusi (Superadmin)
```
1. Verifikasi semua realisasi sudah diinput
2. Jalankan kalkulasi untuk pool
3. Sistem menghitung:
   - Skor P1, P2, P3 per karyawan
   - Skor total (weighted average)
   - Distribusi insentif proporsional
   - PPh 21 otomatis
   - Insentif netto
4. Finalisasi hasil
5. Notifikasi ke karyawan
```

### 5. Lihat Hasil (Employee)
```
1. Login sebagai employee
2. Lihat dashboard dengan:
   - Skor P1, P2, P3
   - Insentif bruto & netto
   - Breakdown perhitungan
3. Download slip PDF
```

---

## Keamanan & RLS

### Row Level Security (RLS)

Semua tabel menggunakan RLS untuk isolasi data antar unit:

#### Policy untuk m_user
```sql
-- Superadmin: lihat semua
-- Unit Manager: lihat user di unit sendiri
-- Employee: lihat data sendiri
CREATE POLICY user_select_policy ON m_user
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM m_user WHERE role = 'superadmin'
  )
  OR (
    auth.uid() IN (
      SELECT id FROM m_user WHERE role = 'unit_manager'
    )
    AND unit_id = (
      SELECT unit_id FROM m_user WHERE id = auth.uid()
    )
  )
  OR id = auth.uid()
);
```

#### Policy untuk t_realization
```sql
-- Unit Manager: hanya CRUD data unit sendiri
CREATE POLICY realization_unit_policy ON t_realization
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM t_pool p
    WHERE p.id = pool_id
    AND p.unit_id = (
      SELECT unit_id FROM m_user WHERE id = auth.uid()
    )
  )
);
```

### Authentication Flow
```
1. User login dengan username/password
2. Supabase Auth membuat session
3. Middleware refresh session otomatis
4. RLS policies enforce data isolation
5. RBAC service check permissions
```

---

## Perhitungan KPI

### Formula Skor Indikator

```typescript
// lib/formulas/kpi-calculator.ts

// Skor = (Realisasi / Target) × 100
function calculateIndicatorScore(
  realisasi: Decimal,
  target: Decimal
): Decimal {
  if (target.isZero()) return new Decimal(0);
  return realisasi.div(target).mul(100);
}
```

### Formula Skor Kategori

```typescript
// Skor Kategori = Σ(Skor Indikator × Bobot Indikator)
function calculateCategoryScore(
  indicators: Array<{
    score: Decimal;
    bobot: Decimal;
  }>
): Decimal {
  return indicators.reduce((sum, ind) => {
    return sum.add(ind.score.mul(ind.bobot).div(100));
  }, new Decimal(0));
}
```

### Formula Skor Total

```typescript
// Skor Total = (P1 × Bobot_P1) + (P2 × Bobot_P2) + (P3 × Bobot_P3)
function calculateTotalScore(
  skorP1: Decimal,
  skorP2: Decimal,
  skorP3: Decimal,
  bobotP1: Decimal,
  bobotP2: Decimal,
  bobotP3: Decimal
): Decimal {
  return skorP1.mul(bobotP1)
    .add(skorP2.mul(bobotP2))
    .add(skorP3.mul(bobotP3))
    .div(100);
}
```

### Formula Distribusi Insentif

```typescript
// services/calculation.service.ts

// 1. Hitung total skor semua karyawan
const totalSkor = employees.reduce((sum, emp) => 
  sum.add(emp.skorTotal), new Decimal(0)
);

// 2. Hitung insentif per karyawan (proporsional)
const insentifBruto = employee.skorTotal
  .div(totalSkor)
  .mul(pool.jumlahInsentif);

// 3. Hitung PPh 21 (5% dari bruto)
const pph21 = insentifBruto.mul(0.05);

// 4. Hitung insentif netto
const insentifNetto = insentifBruto.sub(pph21);
```

### Contoh Perhitungan

```
Pool Unit A: Rp 10.000.000
Karyawan:
- Budi: Skor Total = 85
- Ani: Skor Total = 90
- Citra: Skor Total = 75

Total Skor = 85 + 90 + 75 = 250

Insentif Budi:
- Bruto = (85/250) × 10.000.000 = Rp 3.400.000
- PPh 21 = 3.400.000 × 5% = Rp 170.000
- Netto = 3.400.000 - 170.000 = Rp 3.230.000

Insentif Ani:
- Bruto = (90/250) × 10.000.000 = Rp 3.600.000
- PPh 21 = 3.600.000 × 5% = Rp 180.000
- Netto = 3.600.000 - 180.000 = Rp 3.420.000

Insentif Citra:
- Bruto = (75/250) × 10.000.000 = Rp 3.000.000
- PPh 21 = 3.000.000 × 5% = Rp 150.000
- Netto = 3.000.000 - 150.000 = Rp 2.850.000
```

---

## Panduan Pengguna

### Superadmin

#### Login
```
URL: http://localhost:3000/login
Username: superadmin
Password: [sesuai setup]
```

#### Kelola Unit
```
1. Menu: Admin > Unit Management
2. Klik "Tambah Unit"
3. Isi: Kode Unit, Nama Unit, Parent Unit (opsional)
4. Simpan
```

#### Kelola User
```
1. Menu: Admin > User Management
2. Klik "Tambah User"
3. Isi: Username, Email, Password, Nama Lengkap, Role, Unit
4. Simpan
```

#### Konfigurasi KPI
```
1. Menu: Admin > KPI Configuration
2. Pilih Unit
3. Tambah Kategori (P1/P2/P3)
4. Tambah Indikator per kategori
5. Set bobot dan target
```

#### Buat Pool
```
1. Menu: Admin > Pool Management
2. Klik "Buat Pool"
3. Pilih: Unit, Bulan, Tahun
4. Isi: Jumlah Insentif
5. Simpan (status: draft)
```

#### Jalankan Kalkulasi
```
1. Menu: Admin > Pool Management
2. Pilih pool (status: draft)
3. Klik "Hitung"
4. Sistem proses kalkulasi
5. Lihat hasil di "Detail"
6. Klik "Finalisasi" jika sudah OK
```

### Unit Manager

#### Login
```
URL: http://localhost:3000/login
Username: [username manager]
Password: [password]
```

#### Input Realisasi
```
1. Menu: Manager > Input Realisasi
2. Pilih: Bulan, Tahun
3. Sistem tampilkan form per karyawan
4. Input realisasi per indikator
5. Klik "Simpan"
```

#### Import Excel
```
1. Menu: Manager > Input Realisasi
2. Klik "Download Template"
3. Isi template Excel
4. Klik "Import Excel"
5. Upload file
6. Validasi dan konfirmasi
```

### Employee

#### Login
```
URL: http://localhost:3000/login
Username: [username employee]
Password: [password]
```

#### Lihat Dashboard
```
1. Otomatis redirect ke dashboard
2. Lihat:
   - Skor P1, P2, P3
   - Skor Total
   - Insentif Bruto & Netto
   - Chart performa
```

#### Download Slip
```
1. Dashboard > Pilih periode
2. Klik "Download Slip PDF"
3. PDF berisi:
   - Data karyawan
   - Breakdown skor
   - Rincian insentif
   - TTD digital
```

---

## Troubleshooting

### Login Error
```
Problem: "Invalid credentials"
Solution:
1. Cek username/password
2. Cek user is_active = true
3. Reset password via superadmin
```

### Chunk Load Error
```
Problem: "ChunkLoadError"
Solution:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Rebuild: npm run build
```

### Calculation Error
```
Problem: "Calculation failed"
Solution:
1. Cek semua realisasi sudah diinput
2. Cek bobot kategori total = 100%
3. Cek target indikator > 0
4. Lihat log di t_calculation_log
```

### RLS Policy Error
```
Problem: "Row level security policy violation"
Solution:
1. Cek user role dan unit_id
2. Cek RLS policies di database
3. Refresh session (logout/login)
```

---

## Maintenance

### Backup Database
```sql
-- Via Supabase Dashboard
-- Settings > Database > Backups
-- Atau via pg_dump
pg_dump -h [host] -U postgres -d postgres > backup.sql
```

### Update Dependencies
```bash
npm update
npm audit fix
```

### Monitor Performance
```
1. Menu: Admin > Audit Log
2. Lihat slow queries
3. Optimize indexes jika perlu
```

### Clear Old Data
```sql
-- Hapus audit log > 1 tahun
DELETE FROM t_audit_log 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Hapus notifikasi sudah dibaca > 3 bulan
DELETE FROM t_notification 
WHERE is_read = true 
AND created_at < NOW() - INTERVAL '3 months';
```

---

## Kontak & Support

Untuk pertanyaan atau issue, hubungi tim development atau buat issue di repository.

---

**Versi Dokumentasi**: 1.0  
**Tanggal**: 9 Maret 2026  
**Status**: Production Ready
