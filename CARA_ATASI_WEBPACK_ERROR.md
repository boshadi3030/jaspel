# Cara Mengatasi Webpack Chunk Loading Error

## Gejala Error
- Halaman sempat muncul lalu error
- Console log menunjukkan: `Cannot read properties of undefined (reading 'call')`
- Error terjadi di webpack.js dan berbagai modul Next.js internal

## Penyebab
1. Cache Next.js yang corrupt (.next folder)
2. Cache webpack yang tidak sinkron
3. Hot Module Replacement (HMR) yang bermasalah
4. Module IDs yang tidak konsisten

## Solusi Cepat

### Opsi 1: Jalankan Fix Script (RECOMMENDED)
```powershell
.\scripts\fix-webpack-chunk-error.ps1
```

Script ini akan:
- Stop semua proses Node.js
- Hapus cache .next
- Hapus cache node_modules/.cache
- Clear npm cache
- (Optional) Reinstall dependencies

### Opsi 2: Manual Fix
```powershell
# 1. Stop server
Get-Process -Name node | Stop-Process -Force

# 2. Hapus cache
Remove-Item -Path ".next" -Recurse -Force
Remove-Item -Path "node_modules/.cache" -Recurse -Force

# 3. Clear npm cache
npm cache clean --force

# 4. Restart server
npm run dev
```

## Pencegahan

### 1. Konfigurasi Webpack yang Stabil
File `next.config.js` sudah dikonfigurasi dengan:
- `moduleIds: 'deterministic'` - Untuk ID modul yang konsisten
- Filesystem cache untuk client-side
- Optimasi yang tepat untuk development

### 2. Best Practices
- Jangan force-stop server (gunakan Ctrl+C)
- Hapus .next sebelum build production
- Restart server jika ada perubahan besar di dependencies
- Gunakan `npm run dev` bukan `next dev` langsung

### 3. Jika Error Masih Terjadi
```powershell
# Full clean reinstall
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path ".next" -Recurse -Force
Remove-Item -Path "package-lock.json" -Force
npm install
npm run dev
```

## Testing Setelah Fix
```powershell
.\TEST_AFTER_FIX.ps1
```

Buka browser ke http://localhost:3000 dan pastikan:
- ✓ Halaman login muncul tanpa error
- ✓ Tidak ada error di console
- ✓ Bisa login dan navigasi normal
- ✓ Hot reload berfungsi dengan baik

## Catatan Penting
- Error ini umum terjadi di Next.js development mode
- Tidak akan terjadi di production build
- Jika terjadi berulang, pertimbangkan upgrade Next.js
- Pastikan Node.js versi 20+ untuk kompatibilitas terbaik
