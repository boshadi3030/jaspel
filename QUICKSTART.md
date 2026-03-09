# 🚀 Quick Start Guide - JASPEL System

Panduan cepat untuk menjalankan JASPEL dalam 15 menit.

## ⚡ Prerequisites

- Node.js 18+ terinstall
- Akun Supabase (gratis)
- Git terinstall

## 📦 Step 1: Clone & Install (2 menit)

```bash
# Clone repository
git clone <repository-url>
cd jaspel-kpi-system

# Install dependencies
npm install
```

## 🗄️ Step 2: Setup Supabase (5 menit)

### 2.1 Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) dan login
2. Klik "New Project"
3. Isi:
   - Name: `jaspel-dev`
   - Database Password: (simpan password ini!)
   - Region: Southeast Asia (Singapore)
4. Klik "Create new project"
5. Tunggu ~2 menit hingga selesai

### 2.2 Jalankan Database Schema

1. Di Supabase Dashboard, buka **SQL Editor**
2. Klik "New Query"
3. Copy seluruh isi file `supabase/schema.sql`
4. Paste ke editor
5. Klik **Run** (atau Ctrl+Enter)
6. Pastikan muncul "Success. No rows returned"

### 2.3 (Opsional) Load Sample Data

1. Buat query baru di SQL Editor
2. Copy isi file `supabase/seed.sql`
3. Paste dan Run
4. Data sample akan terisi

### 2.4 Buat User Superadmin

1. Buka **Authentication** → **Users**
2. Klik "Add User" → "Create new user"
3. Isi:
   - Email: `admin@test.com`
   - Password: `Admin123!`
   - Auto Confirm User: ✅ (centang)
4. Klik "Create User"

### 2.5 Update Employee Record

1. Buka **Table Editor** → `m_employees`
2. Cari row dengan `employee_code = 'SA001'`
3. Edit kolom `email` menjadi `admin@test.com`
4. Save

### 2.6 Dapatkan API Keys

1. Buka **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (key yang panjang)

## ⚙️ Step 3: Konfigurasi Environment (1 menit)

```bash
# Buat file .env.local
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

Paste nilai yang di-copy dari step 2.6

## 🎨 Step 4: Jalankan Development Server (1 menit)

```bash
npm run dev
```

Buka browser: [http://localhost:3000](http://localhost:3000)

## 🔐 Step 5: Login & Test (5 menit)

### 5.1 Login sebagai Superadmin

1. Buka `http://localhost:3000`
2. Akan redirect ke halaman login (jika belum ada, buat halaman login sederhana)
3. Login dengan:
   - Email: `admin@test.com`
   - Password: `Admin123!`
4. Seharusnya redirect ke `/admin/dashboard`

### 5.2 Verifikasi Dashboard

Anda akan melihat:
- Total Unit: 5 (jika pakai seed data)
- Total Karyawan: 9
- Total Pool: 1
- Tabs: Units, Karyawan, KPI Config, Pool Dana

### 5.3 Test RLS (Row Level Security)

#### Test 1: Superadmin Access
```bash
# Buka browser console (F12)
# Paste code ini:

const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
)

// Login as superadmin
await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'Admin123!'
})

// Should see ALL units
const { data } = await supabase.from('m_units').select('*')
console.log('Units visible:', data.length) // Should be 5
```

#### Test 2: Unit Manager Access
```bash
# Buat user unit manager dulu via Supabase Auth
# Email: john.doe@example.com
# Password: Test123!

# Update m_employees record untuk email ini

# Login as unit manager
await supabase.auth.signInWithPassword({
  email: 'john.doe@example.com',
  password: 'Test123!'
})

// Should see ONLY their unit
const { data } = await supabase.from('m_units').select('*')
console.log('Units visible:', data.length) // Should be 1
```

## 🧪 Step 6: Test Calculation (2 menit)

### 6.1 Via Browser Console

```javascript
// Jalankan kalkulasi untuk periode sample
const response = await fetch('/api/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ period: '2024-03' })
})

const result = await response.json()
console.log(result)
```

### 6.2 Via Server Action (Recommended)

Buat file `app/admin/test/page.tsx`:

```typescript
import { runFullCalculation } from '@/services/calculation.service'
import { Button } from '@/components/ui/button'

export default function TestPage() {
  async function handleCalculate() {
    'use server'
    const result = await runFullCalculation('2024-03')
    console.log('Calculation result:', result)
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Calculation</h1>
      <form action={handleCalculate}>
        <Button type="submit">Run Calculation</Button>
      </form>
    </div>
  )
}
```

Buka `http://localhost:3000/admin/test` dan klik tombol.

## ✅ Verification Checklist

Pastikan semua ini berfungsi:

- [ ] Development server berjalan tanpa error
- [ ] Bisa login sebagai superadmin
- [ ] Dashboard menampilkan data statistik
- [ ] RLS policies berfungsi (superadmin lihat semua, manager lihat unitnya)
- [ ] Calculation service berjalan tanpa error
- [ ] Data tersimpan di `t_individual_scores` dan `t_calculation_results`

## 🎉 Selesai!

Sistem JASPEL sudah berjalan di local development environment Anda!

## 📚 Next Steps

1. **Explore Dashboard**: Coba navigasi ke semua halaman
2. **Baca Dokumentasi**: 
   - `README.md` - Overview lengkap
   - `API.md` - API documentation
   - `USAGE_EXAMPLES.md` - Contoh penggunaan
3. **Customize**: Sesuaikan dengan kebutuhan organisasi Anda
4. **Deploy**: Ikuti `DEPLOYMENT.md` untuk deploy ke production

## 🐛 Troubleshooting

### Error: "Invalid API Key"
```bash
# Pastikan .env.local sudah benar
cat .env.local

# Restart dev server
npm run dev
```

### Error: "Row Level Security Policy Violation"
```bash
# Check apakah user sudah ada di m_employees
# dengan email yang sama dengan auth user
```

### Error: "Cannot find module"
```bash
# Clear cache dan reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Database Connection Error
```bash
# Check Supabase project status di dashboard
# Pastikan project tidak dalam maintenance mode
```

## 💡 Tips

1. **Development**: Gunakan seed data untuk testing
2. **Testing**: Buat user dengan role berbeda untuk test RLS
3. **Debugging**: Check Supabase Logs untuk query errors
4. **Performance**: Monitor di Supabase Reports

## 📞 Need Help?

- Check `README.md` untuk dokumentasi lengkap
- Review `USAGE_EXAMPLES.md` untuk contoh kode
- Lihat `API.md` untuk API reference
- Baca `DEPLOYMENT.md` untuk production deployment

---

**Selamat! Anda sudah berhasil setup JASPEL System! 🎊**
