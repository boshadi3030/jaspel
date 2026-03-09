# Panduan Deployment JASPEL System

## 📋 Prerequisites

- Node.js 18+ terinstall
- Akun Supabase (gratis atau berbayar)
- Akun Vercel (opsional, untuk deployment)
- Git terinstall

## 🗄️ Setup Database Supabase

### 1. Buat Project Supabase

1. Kunjungi [supabase.com](https://supabase.com)
2. Klik "New Project"
3. Isi detail project:
   - Name: `jaspel-production`
   - Database Password: (simpan dengan aman)
   - Region: Pilih yang terdekat dengan lokasi Anda
4. Tunggu hingga project selesai dibuat (~2 menit)

### 2. Jalankan Database Schema

1. Buka Supabase Dashboard → SQL Editor
2. Klik "New Query"
3. Copy seluruh isi file `supabase/schema.sql`
4. Paste ke SQL Editor
5. Klik "Run" atau tekan Ctrl+Enter
6. Pastikan tidak ada error (semua query berhasil)

### 3. (Opsional) Jalankan Seed Data

1. Di SQL Editor, buat query baru
2. Copy seluruh isi file `supabase/seed.sql`
3. Paste dan jalankan
4. Data sample akan terisi untuk testing

### 4. Setup Authentication

#### a. Konfigurasi Email Provider
1. Buka Authentication → Settings → Auth Providers
2. Pastikan Email provider aktif
3. Konfigurasi email template (opsional)

#### b. Buat User Superadmin
1. Buka Authentication → Users
2. Klik "Add User" → "Create new user"
3. Isi:
   - Email: `admin@yourdomain.com`
   - Password: (password yang kuat)
   - Auto Confirm User: ✓ (centang)
4. Klik "Create User"

#### c. Update Employee Record
1. Buka Table Editor → `m_employees`
2. Cari atau buat record dengan:
   - `employee_code`: SA001
   - `email`: sama dengan user yang dibuat di step b
   - `role`: superadmin
   - `is_active`: true

### 5. Dapatkan API Credentials

1. Buka Settings → API
2. Copy nilai berikut:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (key yang panjang)
3. Simpan untuk konfigurasi environment

## 🚀 Deployment ke Vercel

### 1. Push ke GitHub

```bash
# Inisialisasi git (jika belum)
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit: JASPEL KPI System"

# Buat repository di GitHub, lalu:
git remote add origin https://github.com/username/jaspel-kpi.git
git branch -M main
git push -u origin main
```

### 2. Deploy ke Vercel

#### Via Vercel Dashboard (Recommended)

1. Kunjungi [vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik "Add New" → "Project"
4. Import repository `jaspel-kpi`
5. Konfigurasi:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. **Environment Variables** - Tambahkan:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

7. Klik "Deploy"
8. Tunggu hingga deployment selesai (~2-3 menit)

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Ikuti prompt:
# - Set up and deploy? Y
# - Which scope? (pilih account Anda)
# - Link to existing project? N
# - Project name? jaspel-kpi
# - Directory? ./
# - Override settings? N

# Tambahkan environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste value, tekan Enter

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste value, tekan Enter

# Deploy production
vercel --prod
```

### 3. Konfigurasi Domain (Opsional)

1. Di Vercel Dashboard → Settings → Domains
2. Tambahkan custom domain Anda
3. Update DNS records sesuai instruksi Vercel
4. Tunggu propagasi DNS (~24 jam)

## 🔐 Konfigurasi Keamanan Supabase

### 1. Update Allowed URLs

1. Buka Supabase Dashboard → Authentication → URL Configuration
2. Tambahkan production URL ke:
   - **Site URL**: `https://your-domain.vercel.app`
   - **Redirect URLs**: 
     - `https://your-domain.vercel.app/**`
     - `http://localhost:3000/**` (untuk development)

### 2. Enable RLS (Sudah otomatis dari schema)

Pastikan semua tabel memiliki RLS enabled:
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Semua tabel harus memiliki `rowsecurity = true`

### 3. Review RLS Policies

```sql
-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 🧪 Testing Deployment

### 1. Test Authentication

1. Buka `https://your-domain.vercel.app`
2. Klik "Login"
3. Login dengan user superadmin yang dibuat
4. Pastikan redirect ke `/admin/dashboard`

### 2. Test RLS Policies

#### Test Superadmin Access
1. Login sebagai superadmin
2. Buka `/admin/dashboard`
3. Pastikan bisa melihat semua unit dan karyawan

#### Test Unit Manager Access
1. Buat user baru dengan role `unit_manager`
2. Login dengan user tersebut
3. Pastikan hanya bisa melihat data unitnya

#### Test Employee Access
1. Buat user baru dengan role `employee`
2. Login dengan user tersebut
3. Pastikan hanya bisa melihat data pribadi

### 3. Test Calculation

```bash
# Via browser console atau API endpoint
await fetch('/api/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ period: '2024-03' })
})
```

## 📊 Monitoring & Maintenance

### 1. Monitor Logs

#### Vercel Logs
```bash
vercel logs
```

#### Supabase Logs
1. Buka Supabase Dashboard → Logs
2. Pilih service: API, Auth, Database
3. Filter by time range

### 2. Database Backup

#### Automatic Backups (Supabase Pro)
- Daily automatic backups
- Point-in-time recovery

#### Manual Backup
```bash
# Via Supabase CLI
supabase db dump -f backup.sql

# Via pg_dump (jika ada akses direct)
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

### 3. Performance Monitoring

1. Buka Supabase Dashboard → Reports
2. Monitor:
   - API requests
   - Database connections
   - Query performance
   - Storage usage

## 🔄 Update & Rollback

### Update Application

```bash
# Pull latest changes
git pull origin main

# Deploy to Vercel
vercel --prod
```

### Rollback Deployment

```bash
# Via Vercel Dashboard
# 1. Buka Deployments
# 2. Pilih deployment sebelumnya
# 3. Klik "Promote to Production"

# Via CLI
vercel rollback
```

### Database Migration

```bash
# Buat migration file baru
# supabase/migrations/20240315_add_new_feature.sql

# Jalankan via SQL Editor atau Supabase CLI
supabase db push
```

## 🚨 Troubleshooting

### Error: "Invalid API Key"
- Pastikan environment variables sudah benar
- Redeploy dengan `vercel --prod`

### Error: "Row Level Security Policy Violation"
- Check RLS policies di Supabase
- Pastikan user memiliki role yang benar di `m_employees`

### Error: "Database Connection Failed"
- Check Supabase project status
- Verify database tidak dalam maintenance mode

### Slow Performance
- Enable database indexes (sudah ada di schema)
- Check query performance di Supabase Reports
- Consider upgrading Supabase plan

## 📞 Support

Untuk bantuan lebih lanjut:
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
