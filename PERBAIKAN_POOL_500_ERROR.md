# Perbaikan Error 500 pada Halaman Pool

## Masalah
Halaman pool (http://localhost:3002/pool) menampilkan error 500 Internal Server Error.

## Penyebab
Fungsi-fungsi RLS (Row Level Security) di database masih menggunakan kolom `role` dari tabel `m_employees`, padahal sistem sudah diubah untuk menyimpan role di `auth.users.user_metadata.role`.

Fungsi yang bermasalah:
- `is_superadmin()` - mengecek role dari m_employees.role
- `is_unit_manager()` - mengecek role dari m_employees.role

## Solusi
Memperbaiki fungsi-fungsi RLS untuk menggunakan `auth.users.user_metadata.role`:

### Migration: `fix_rls_functions_use_metadata.sql`

```sql
-- 1. Fix is_superadmin()
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix is_unit_manager()
CREATE OR REPLACE FUNCTION is_unit_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'unit_manager',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create is_employee()
CREATE OR REPLACE FUNCTION is_employee()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'employee',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Status
✅ Migration berhasil diterapkan
✅ Fungsi RLS sudah diperbaiki

## Testing
1. Logout dari aplikasi
2. Login ulang sebagai superadmin
3. Akses halaman pool: http://localhost:3002/pool
4. Halaman seharusnya tampil tanpa error

## File yang Diubah
- `supabase/migrations/fix_rls_functions_use_metadata.sql` (baru)

## Catatan
- Tidak ada perubahan pada kode aplikasi
- Hanya perbaikan fungsi database
- RLS policies tetap sama, hanya fungsi helper yang diperbaiki
