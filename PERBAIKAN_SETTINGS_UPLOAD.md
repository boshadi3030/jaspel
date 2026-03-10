# Perbaikan Upload Logo dan Pengaturan Sistem

## Masalah yang Diperbaiki

1. ❌ Notifikasi "gagal mengunggah logo" saat menyimpan pengaturan
2. ❌ Logo tidak ditampilkan di aplikasi setelah upload
3. ❌ Pengaturan tidak konsisten di seluruh aplikasi

## Perbaikan yang Dilakukan

### 1. Upload Logo (app/(authenticated)/settings/page.tsx)
- ✅ Perbaikan error handling dengan pesan error yang jelas
- ✅ Tambahan cache control dan upsert untuk menghindari konflik
- ✅ Hapus logo lama otomatis saat upload logo baru
- ✅ Validasi ukuran file (max 2MB) dan tipe file (PNG/JPG/SVG)
- ✅ Preview logo sebelum upload
- ✅ Notifikasi progress upload yang informatif

### 2. Integrasi Logo di Sidebar (components/navigation/Sidebar.tsx)
- ✅ Load company info dari API settings
- ✅ Tampilkan logo di header sidebar (desktop & mobile)
- ✅ Fallback ke initial "J" jika logo belum diupload
- ✅ Tampilkan nama aplikasi dinamis dari pengaturan

### 3. Footer Dinamis (components/layout/Footer.tsx)
- ✅ Load footer text dari pengaturan
- ✅ Cache 5 menit untuk performa
- ✅ Fallback ke default text jika gagal load

### 4. Penyimpanan Data
- ✅ Struktur data konsisten di t_settings:
  - `company_info`: { appName, name, address, phone, email, logo, footer }
  - `footer`: { text } (untuk backward compatibility)
- ✅ Audit trail untuk setiap perubahan
- ✅ Auto-refresh setelah save untuk update UI

## Cara Menggunakan

### Upload Logo:
1. Login sebagai Superadmin
2. Buka menu "Pengaturan" di sidebar
3. Klik "Upload Logo Baru" atau drag & drop file
4. File akan divalidasi (max 2MB, format PNG/JPG/SVG)
5. Preview akan muncul sebelum save
6. Klik "Simpan Pengaturan"
7. Logo akan muncul di sidebar dan laporan PDF

### Update Informasi Organisasi:
1. Isi form "Informasi Organisasi":
   - Nama Organisasi
   - Alamat
   - Telepon
   - Email
2. Isi "Teks Footer" untuk footer aplikasi
3. Klik "Simpan Pengaturan"
4. Halaman akan refresh otomatis untuk menampilkan perubahan

## Testing

Jalankan test untuk verifikasi:
```powershell
.\TEST_SETTINGS_UPLOAD.ps1
```

Atau manual:
```powershell
npx tsx scripts/test-settings-upload.ts
```

## Lokasi File yang Diubah

1. `app/(authenticated)/settings/page.tsx` - Halaman pengaturan
2. `components/navigation/Sidebar.tsx` - Sidebar dengan logo
3. `components/layout/Footer.tsx` - Footer dinamis
4. `lib/services/settings.service.ts` - Service pengaturan (client)
5. `lib/services/settings.server.service.ts` - Service pengaturan (server)

## Storage Configuration

- Bucket: `public`
- Folder: `logos/`
- Max size: 2MB
- Allowed types: PNG, JPG, SVG
- Public access: Enabled

## Catatan Penting

- Logo disimpan di Supabase Storage bucket "public"
- URL logo disimpan di database (t_settings)
- Logo lama otomatis dihapus saat upload logo baru
- Pengaturan di-cache 5 menit untuk performa
- Refresh otomatis setelah save untuk update UI
