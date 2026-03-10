# START_PRODUCTION.ps1
# Script untuk menjalankan aplikasi dalam production mode

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  JASPEL Production Build & Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: File .env.local tidak ditemukan!" -ForegroundColor Red
    Write-Host "Silakan copy .env.local.example ke .env.local dan isi dengan konfigurasi yang benar." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}

# Step 1: Build production
Write-Host "Step 1: Building production..." -ForegroundColor Yellow
Write-Host ""

try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Build gagal!" -ForegroundColor Red
    Write-Host "Silakan periksa error di atas dan perbaiki sebelum menjalankan production." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Build berhasil!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Step 2: Start production server
Write-Host "Step 2: Starting production server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Server akan berjalan di: http://localhost:3002" -ForegroundColor Cyan
Write-Host "Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Yellow
Write-Host ""

try {
    npm run start
} catch {
    Write-Host ""
    Write-Host "ERROR: Server gagal dijalankan!" -ForegroundColor Red
    Write-Host ""
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}
