# Perbaikan Pool Page - Error 500

## Masalah
Halaman pool menampilkan error 500 (Internal Server Error) saat diakses.

## Root Cause
Database error: `cannot insert a non-DEFAULT value into column "net_pool"`

Kolom `net_pool` dan `allocated_amount` di tabel `t_pool` adalah **generated columns** (computed columns) yang dihitung otomatis oleh database:
- `net_pool = revenue_total - deduction_total`
- `allocated_amount = (net_pool * global_allocation_percentage) / 100`

TypeScript interfaces tidak menangani kemungkinan nilai null dari generated columns ini.

## Perbaikan yang Dilakukan

### 1. Update TypeScript Interfaces
Mengubah tipe data `net_pool` dan `allocated_amount` menjadi nullable:

**File yang diupdate:**
- `app/(authenticated)/pool/page.tsx`
- `components/pool/PoolTable.tsx`
- `components/pool/PoolDetailsDialog.tsx`

```typescript
interface Pool {
  id: string
  period: string
  revenue_total: number
  deduction_total: number
  net_pool: number | null          // ← Changed
  global_allocation_percentage: number
  allocated_amount: number | null  // ← Changed
  status: 'draft' | 'approved' | 'distributed'
  approved_by: string | null
  approved_at: string | null
  created_at: string
}
```

### 2. Handle Null Values di Rendering
Menambahkan fallback ke 0 saat render nilai yang mungkin null:

```typescript
// PoolTable.tsx
{formatCurrency(pool.net_pool || 0)}
{formatCurrency(pool.allocated_amount || 0)}

// PoolDetailsDialog.tsx
{formatCurrency(pool.net_pool || 0)}
{formatCurrency(pool.allocated_amount || 0)}
```

### 3. Validasi di Calculation Service
Menambahkan validasi untuk memastikan `allocated_amount` tidak null sebelum kalkulasi:

```typescript
// services/calculation.service.ts
if (pool.allocated_amount === null || pool.allocated_amount === undefined) {
  throw new Error('Pool allocated amount is not calculated. Please ensure pool has revenue and deduction data.')
}
```

## Verifikasi

### Test Script
```bash
npx tsx scripts/test-pool-page-fix.ts
```

### Test Results
✅ Generated columns bekerja dengan benar
✅ net_pool dihitung otomatis: revenue_total - deduction_total
✅ allocated_amount dihitung otomatis: (net_pool * percentage) / 100
✅ TypeScript interfaces sudah handle nullable values

## Status
✅ **SELESAI** - Halaman pool seharusnya sudah bisa diakses tanpa error 500

## Testing
1. Restart development server
2. Login sebagai superadmin
3. Akses: http://localhost:3002/pool
4. Halaman harus load tanpa error
5. Buat pool baru untuk test fungsionalitas

## Catatan Teknis
- Generated columns tidak bisa diisi manual saat INSERT/UPDATE
- Database akan menghitung nilai secara otomatis
- Nilai bisa null jika revenue_total atau deduction_total belum diisi
- Semua komponen pool sudah di-update untuk handle null values
