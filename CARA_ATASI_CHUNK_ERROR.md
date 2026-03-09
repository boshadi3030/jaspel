# Cara Mengatasi Chunk Error 404

## Gejala
- Error 404 pada file chunk di console browser
- Halaman tidak load dengan benar
- Hot reload tidak berfungsi

## Penyebab
- Cache Next.js yang corrupt
- Hot reload issue di Next.js 15
- Browser cache yang outdated

## Solusi Cepat

### 1. Jalankan Script Perbaikan
```powershell
.\PERBAIKI_CHUNK_ERROR.ps1
```

### 2. Start Server
```powershell
npm run dev
```

### 3. Clear Browser
- Tutup semua tab localhost:3002
- Clear browser cache (Ctrl+Shift+Delete)
- Buka incognito mode
- Akses http://localhost:3002/login

## Pencegahan

Konfigurasi Next.js sudah dioptimasi untuk mencegah chunk error:
- Cache dimatikan di development
- Code splitting disabled di dev mode
- Named IDs untuk stabilitas

## Jika Masih Error

1. Stop server (Ctrl+C)
2. Hapus manual:
   ```powershell
   Remove-Item -Path ".next" -Recurse -Force
   Remove-Item -Path "node_modules/.cache" -Recurse -Force
   ```
3. Restart komputer (jika perlu)
4. Start ulang server
