# Panduan Instalasi JASPEL KPI System

## Prerequisites

- Node.js 20+ 
- npm atau yarn
- Akun Supabase (gratis)
- Git

## Langkah Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd jaspel-kpi-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

#### A. Buat Project di Supabase
1. Buka https://supabase.com
2. Buat project baru
3. Tunggu hingga database ready

#### B. Apply Schema
1. Buka SQL Editor di Supabase Dashboard
2. Copy isi file `supabase/schema.sql`
3. Paste dan execute

#### C. (Optional) Load Sample Data
```sql
-- Copy dan execute dari supabase/seed.sql
```

### 4. Setup Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Cara mendapatkan keys:**
1. Buka Supabase Dashboard
2. Settings → API
3. Copy URL dan keys yang diperlukan

### 5. Create Superadmin User

```bash
npm run setup:auth
```

Ikuti prompt untuk membuat user superadmin pertama.

### 6. Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000

### 7. Login

Gunakan kredensial superadmin yang dibuat di step 5.

## Troubleshooting

### Error: "Invalid API key"
- Pastikan `.env.local` sudah benar
- Restart development server

### Error: "Database connection failed"
- Cek Supabase project masih aktif
- Cek URL dan keys di `.env.local`

### Error: "RLS policy violation"
- Pastikan schema sudah di-apply dengan benar
- Cek RLS policies di Supabase Dashboard

### Login Loop
- Clear browser cache dan cookies
- Restart development server
- Cek middleware.ts tidak ada error

## Next Steps

Setelah instalasi berhasil:

1. Baca `README.md` untuk usage guide
2. Baca `DATABASE_SETUP.md` untuk detail database
3. Baca `API.md` untuk API documentation
4. Baca `DEPLOYMENT.md` untuk production deployment

## Support

Jika mengalami masalah:
1. Cek console browser untuk error messages
2. Cek terminal untuk server errors
3. Review dokumentasi di folder root
4. Cek Supabase logs di Dashboard

---

**Selamat! Sistem siap digunakan.** 🎉
