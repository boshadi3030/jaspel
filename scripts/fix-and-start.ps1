# Script untuk memperbaiki error dan menjalankan server
Write-Host "=== Memperbaiki Error dan Menjalankan Server ===" -ForegroundColor Cyan

# 1. Stop semua proses Node.js
Write-Host "`n1. Menghentikan proses Node.js..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Hapus cache Next.js
Write-Host "`n2. Menghapus cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "   Cache .next dihapus" -ForegroundColor Green
}

# 3. Verifikasi dependencies penting
Write-Host "`n3. Memeriksa dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$hasAutoprefixer = $packageJson.devDependencies.autoprefixer
$hasPostcss = $packageJson.devDependencies.postcss
$hasTailwind = $packageJson.devDependencies.tailwindcss

if (-not $hasAutoprefixer -or -not $hasPostcss -or -not $hasTailwind) {
    Write-Host "   Dependencies tidak lengkap, menginstall ulang..." -ForegroundColor Yellow
    npm install --save-dev autoprefixer postcss tailwindcss
} else {
    Write-Host "   Dependencies lengkap" -ForegroundColor Green
}

# 4. Verifikasi file penting
Write-Host "`n4. Memeriksa file penting..." -ForegroundColor Yellow

# Buat public folder jika belum ada
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" | Out-Null
    Write-Host "   Folder public dibuat" -ForegroundColor Green
}

# Buat favicon.ico placeholder jika belum ada
if (-not (Test-Path "public/favicon.ico")) {
    # Buat file kosong sebagai placeholder
    New-Item -ItemType File -Path "public/favicon.ico" -Force | Out-Null
    Write-Host "   Favicon.ico dibuat" -ForegroundColor Green
}

# 5. Jalankan server
Write-Host "`n5. Menjalankan development server..." -ForegroundColor Yellow
Write-Host "   Server akan berjalan di http://localhost:3002" -ForegroundColor Cyan
Write-Host "   Tekan Ctrl+C untuk menghentikan server`n" -ForegroundColor Yellow

npm run dev:legacy
