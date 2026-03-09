# JASPEL Development Server Starter
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  JASPEL KPI System - Dev Server  " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .next exists
if (-not (Test-Path ".next")) {
    Write-Host "Build folder tidak ditemukan. Menjalankan build..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Build gagal! Periksa error di atas." -ForegroundColor Red
        exit 1
    }
}

# Check critical files
Write-Host "Memeriksa file penting..." -ForegroundColor Yellow
$loginPage = ".next\server\app\login\page.js"
if (Test-Path $loginPage) {
    Write-Host "✓ Login page: OK" -ForegroundColor Green
} else {
    Write-Host "✗ Login page: TIDAK DITEMUKAN!" -ForegroundColor Red
    Write-Host "Menjalankan rebuild..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    npm run build
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Server akan berjalan di:        " -ForegroundColor Cyan
Write-Host "  http://localhost:3002           " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Kredensial testing:" -ForegroundColor Yellow
Write-Host "  Email: mukhsin9@gmail.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Gray
Write-Host ""

# Start dev server
npm run dev
