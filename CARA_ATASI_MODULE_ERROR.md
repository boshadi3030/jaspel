# Cara Mengatasi Module Error dan Webpack Error

## Error yang Terjadi

1. **Cannot find module 'autoprefixer'**
2. **Cannot find module 'next-flight-client-entry-loader'**
3. **500 Internal Server Error** pada dashboard
4. **Build Error** - Failed to compile

## Penyebab

- Node modules corrupt atau tidak lengkap
- Cache webpack yang rusak
- Build artifacts yang conflict
- Dependencies tidak terinstall dengan benar

## Solusi

### Opsi 1: Quick Fix (Rekomendasi - 1 menit)

```powershell
.\PERBAIKI_WEBPACK_ERROR.ps1
```

Pilih opsi **1** untuk quick fix yang akan:
- Menghentikan dev server
- Membersihkan .next dan cache
- Memverifikasi dan install package yang hilang
- Membersihkan npm cache
- Restart dev server

### Opsi 2: Full Fix (Jika Quick Fix Gagal - 5-10 menit)

```powershell
.\PERBAIKI_WEBPACK_ERROR.ps1
```

Pilih opsi **2** untuk full fix yang akan:
- Menghapus semua node_modules
- Menghapus package-lock.json
- Reinstall semua dependencies dari awal
- Memverifikasi package kritis
- Restart dev server

### Manual Fix (Alternatif)

Jika script tidak bekerja, jalankan manual:

```powershell
# Stop server
Get-Process -Name node | Stop-Process -Force

# Clean cache
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache

# Reinstall dependencies
npm cache clean --force
npm install --legacy-peer-deps

# Start server
npm run dev
```

## Verifikasi

Setelah perbaikan, cek:

1. Server berjalan tanpa error di http://localhost:3002
2. Tidak ada error "Cannot find module" di console
3. Dashboard dapat diakses tanpa 500 error
4. Hot reload berfungsi normal

## Pencegahan

Untuk menghindari error ini di masa depan:

1. Jangan interrupt npm install
2. Gunakan `--legacy-peer-deps` saat install package baru
3. Bersihkan cache secara berkala
4. Commit package-lock.json ke git

## Troubleshooting

Jika masih error setelah full fix:

1. Cek versi Node.js: `node --version` (harus 20+)
2. Cek versi npm: `npm --version` (harus 9+)
3. Update npm: `npm install -g npm@latest`
4. Hapus manual node_modules dan reinstall
5. Restart komputer (untuk clear semua lock files)
