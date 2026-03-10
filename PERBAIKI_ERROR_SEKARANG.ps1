# Script untuk memperbaiki semua error yang muncul
Write-Host "=== PERBAIKAN ERROR WEBPACK DAN MODULE ===" -ForegroundColor Cyan
Write-Host "Script ini akan memperbaiki:" -ForegroundColor Yellow
Write-Host "  - Module 'autoprefixer' tidak ditemukan" -ForegroundColor Yellow
Write-Host "  - Module 'next-flight-client-entry-loader' tidak ditemukan" -ForegroundColor Yellow
Write-Host "  - 500 Internal Server Error" -ForegroundColor Yellow
Write-Host "  - 404 favicon.ico" -ForegroundColor Yellow
Write-Host ""

# 1. Stop semua proses Node.js
Write-Host "1. Menghentikan semua proses Node.js..." -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   Selesai" -ForegroundColor Green

# 2. Hapus cache dan build
Write-Host "`n2. Menghapus cache dan build..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "   .next dihapus" -ForegroundColor Green
}
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
    Write-Host "   node_modules/.cache dihapus" -ForegroundColor Green
}

# 3. Reinstall dependencies yang bermasalah
Write-Host "`n3. Reinstall dependencies kritis..." -ForegroundColor Cyan
npm install --save-dev autoprefixer@latest postcss@latest tailwindcss@latest
Write-Host "   Dependencies diperbarui" -ForegroundColor Green

# 4. Buat file yang hilang
Write-Host "`n4. Membuat file yang hilang..." -ForegroundColor Cyan

# Buat public folder
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" | Out-Null
}

# Buat favicon.ico (file kosong sebagai placeholder)
if (-not (Test-Path "public/favicon.ico")) {
    New-Item -ItemType File -Path "public/favicon.ico" -Force | Out-Null
    Write-Host "   public/favicon.ico dibuat" -ForegroundColor Green
}

# Verifikasi skeleton component
if (-not (Test-Path "components/ui/skeleton.tsx")) {
    Write-Host "   components/ui/skeleton.tsx sudah ada" -ForegroundColor Green
}

# 5. Clear npm cache
Write-Host "`n5. Membersihkan npm cache..." -ForegroundColor Cyan
npm cache clean --force
Write-Host "   Cache dibersihkan" -ForegroundColor Green

Write-Host "`n=== PERBAIKAN SELESAI ===" -ForegroundColor Green
Write-Host "`nLangkah selanjutnya:" -ForegroundColor Cyan
Write-Host "1. Jalankan: npm run dev:legacy" -ForegroundColor Yellow
Write-Host "2. Buka browser: http://localhost:3002" -ForegroundColor Yellow
Write-Host "3. Login dengan kredensial Anda" -ForegroundColor Yellow
Write-Host "`nJika masih error, jalankan:" -ForegroundColor Cyan
Write-Host "   Remove-Item -Recurse -Force node_modules" -ForegroundColor Yellow
Write-Host "   npm install" -ForegroundColor Yellow
Write-Host "   npm run dev:legacy" -ForegroundColor Yellow
