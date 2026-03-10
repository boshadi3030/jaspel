# Perbaikan Login Issue

## Masalah
Login gagal dengan error `user_not_found` di URL meskipun user ada di database.

## Akar Masalah
Setelah migrasi user-employee separation, kolom `role` dan `email` telah dihapus dari tabel `m_employees` (lihat `cleanup_old_employee_columns.sql`). Informasi tersebut sekarang disimpan di `auth.users.user_metadata`.

Namun, beberapa bagian kode masih mencoba mengambil kolom `role` dari tabel `m_employees`, yang menyebabkan error.

## File yang Diperbaiki

### 1. middleware.ts
**Masalah:** Mencoba select kolom `role` dari `m_employees`
```typescript
// SEBELUM (SALAH)
const { data: employee } = await supabase
  .from('m_employees')
  .select('role, is_active')  // ❌ kolom 'role' tidak ada
  .eq('user_id', session.user.id)
```

**Perbaikan:** Ambil role dari `user_metadata`
```typescript
// SESUDAH (BENAR)
const role = session.user.user_metadata?.role as Role

const { data: employee } = await supabase
  .from('m_employees')
  .select('is_active')  // ✅ hanya ambil is_active
  .eq('user_id', session.user.id)
```

### 2. app/dashboard/page.tsx
**Masalah:** Mencoba select kolom `role` dari `m_employees`
```typescript
// SEBELUM (SALAH)
const { data: employee } = await supabase
  .from('m_employees')
  .select('id, employee_code, full_name, unit_id, role, m_units(name)')  // ❌ kolom 'role' tidak ada
  .eq('user_id', session.user.id)
  .single()

const role = employee.role  // ❌ undefined
```

**Perbaikan:** Ambil role dari `user_metadata`
```typescript
// SESUDAH (BENAR)
const role = session.user.user_metadata?.role as 'superadmin' | 'unit_manager' | 'employee'

const { data: employee } = await supabase
  .from('m_employees')
  .select('id, employee_code, full_name, unit_id, m_units(name)')  // ✅ tanpa role
  .eq('user_id', session.user.id)
  .single()
```

## Struktur Data Setelah Migrasi

### Tabel m_employees
```sql
CREATE TABLE m_employees (
  id UUID PRIMARY KEY,
  employee_code VARCHAR(50),
  full_name VARCHAR(255),
  unit_id UUID,
  tax_status VARCHAR(10),
  is_active BOOLEAN,
  user_id UUID REFERENCES auth.users(id),  -- Link ke auth
  -- ❌ TIDAK ADA: role, email
  ...
)
```

### auth.users.user_metadata
```json
{
  "role": "superadmin",
  "employee_id": "f8b70281-2c1f-44c1-9dfe-b8936b2739ed",
  "full_name": "Mukhsin",
  "unit_id": "355f1c62-27fb-4205-87ae-0d21fa724901",
  "email_verified": true
}
```

## Cara Mengambil Data User

### ✅ BENAR - Ambil role dari user_metadata
```typescript
const { data: { session } } = await supabase.auth.getSession()
const role = session.user.user_metadata?.role

const { data: employee } = await supabase
  .from('m_employees')
  .select('id, full_name, unit_id, is_active')
  .eq('user_id', session.user.id)
  .single()
```

### ❌ SALAH - Mencoba ambil role dari m_employees
```typescript
const { data: employee } = await supabase
  .from('m_employees')
  .select('id, full_name, role, email')  // ❌ kolom tidak ada
  .eq('user_id', session.user.id)
  .single()
```

## Testing

### 1. Test Backend Login
```bash
npx tsx scripts/test-login-now-fixed.ts
```

### 2. Test Web Login
```bash
.\TEST_LOGIN_FIXED.ps1
```

Kemudian buka browser ke `http://localhost:3002/login` dan login dengan:
- Email: `mukhsin9@gmail.com`
- Password: `admin123`

## Hasil
✅ Login berhasil
✅ Middleware dapat mengambil role dari user_metadata
✅ Dashboard dapat menampilkan data user dengan benar
✅ Tidak ada lagi error `user_not_found`

## Catatan Penting
Setelah migrasi user-employee separation:
1. **SELALU** ambil `role` dari `session.user.user_metadata.role`
2. **JANGAN** select kolom `role` atau `email` dari `m_employees`
3. Tabel `m_employees` hanya menyimpan data pegawai (nama, unit, status, dll)
4. Autentikasi dan role management sepenuhnya di `auth.users`
