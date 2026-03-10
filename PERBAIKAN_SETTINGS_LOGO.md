# Perbaikan Settings & Logo Upload

## Masalah yang Diperbaiki

### 1. Error Upload Logo (RLS Policy)
**Error:** `new row violates row-level security policy`

**Penyebab:**
- Storage bucket `logos` tidak memiliki policy INSERT untuk authenticated users
- Hanya ada policy untuk SELECT, UPDATE, dan DELETE

**Solusi:**
```sql
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');
```

### 2. Error Foreign Key Constraint
**Error:** `insert or update on table "t_settings" violates foreign key constraint "t_settings_updated_by_fkey"`

**Penyebab:**
- Foreign key `updated_by` mereferensi `m_employees(id)` 
- Seharusnya mereferensi `auth.users(id)` karena menggunakan Supabase Auth

**Solusi:**
```sql
ALTER TABLE t_settings 
DROP CONSTRAINT IF EXISTS t_settings_updated_by_fkey;

ALTER TABLE t_settings 
ADD CONSTRAINT t_settings_updated_by_fkey 
FOREIGN KEY (updated_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;
```

### 3. Konfigurasi yang Hilang
**Masalah:** Halaman settings hanya menampilkan informasi organisasi dan footer

**Konfigurasi yang ditambahkan:**
- ✅ Konfigurasi Pajak PPh 21 (TK/0, K/0, K/1, K/2, K/3)
- ✅ Parameter Perhitungan (Min Score, Max Score)
- ✅ Session Timeout (1-24 jam)

### 4. RLS Policies untuk t_settings
**Masalah:** Tabel `t_settings` tidak memiliki RLS policies

**Solusi:**
```sql
-- Enable RLS
ALTER TABLE t_settings ENABLE ROW LEVEL SECURITY;

-- Superadmin full access
CREATE POLICY "Superadmin full access to settings"
  ON t_settings FOR ALL
  TO authenticated
  USING (is_superadmin());

-- Authenticated users can view
CREATE POLICY "Authenticated users can view settings"
  ON t_settings FOR SELECT
  TO authenticated
  USING (true);
```

## Fitur Lengkap Halaman Settings

### 1. Informasi Organisasi
- Nama Organisasi
- Alamat
- Telepon
- Email

### 2. Logo Organisasi
- Upload logo (max 2MB)
- Format: JPG, PNG, SVG, WebP
- Preview logo saat ini
- Public URL untuk akses

### 3. Konfigurasi Pajak PPh 21
- TK/0 (Tidak Kawin, 0 Tanggungan): 5%
- TK/1 (Tidak Kawin, 1 Tanggungan): 5%
- TK/2 (Tidak Kawin, 2 Tanggungan): 15%
- TK/3 (Tidak Kawin, 3 Tanggungan): 15%
- K/0 (Kawin, 0 Tanggungan): 5%
- K/1 (Kawin, 1 Tanggungan): 15%
- K/2 (Kawin, 2 Tanggungan): 25%
- K/3 (Kawin, 3 Tanggungan): 30%

### 4. Parameter Perhitungan
- Skor Minimum: 0
- Skor Maksimum: 100

### 5. Session Timeout
- Durasi sesi login (1-24 jam)
- Default: 8 jam

### 6. Teks Footer
- Teks yang ditampilkan di bagian bawah aplikasi

## Cara Menggunakan

1. Login sebagai superadmin
2. Buka menu Settings
3. Upload logo (opsional)
4. Isi semua konfigurasi yang diperlukan
5. Klik "Simpan Pengaturan"

## Testing

Jalankan script test:
```powershell
.\TEST_SETTINGS_LOGO.ps1
```

Atau manual:
```bash
npx tsx scripts/test-settings-logo-upload.ts
```

## Integrasi dengan Sistem

### 1. Perhitungan Pajak
Konfigurasi pajak digunakan di:
- `services/calculation.service.ts` - Perhitungan PPh 21
- `lib/formulas/kpi-calculator.ts` - Kalkulasi net incentive

### 2. Logo
Logo digunakan di:
- PDF slip gaji (`lib/export/pdf-export.ts`)
- Header aplikasi
- Report generation

### 3. Footer
Footer digunakan di:
- `components/layout/Footer.tsx`
- PDF reports
- Email templates

### 4. Session Timeout
Session timeout digunakan di:
- `middleware.ts` - Auto logout
- Auth service

## Migrasi yang Diterapkan

1. `add_settings_rls_policies` - RLS policies untuk t_settings
2. `fix_settings_foreign_key` - Perbaikan foreign key constraint

## Status

✅ Upload logo berhasil
✅ Semua konfigurasi tersimpan dengan benar
✅ RLS policies berfungsi
✅ Foreign key constraints diperbaiki
✅ Integrasi dengan database lengkap
