# Script untuk membersihkan cache dan memulai server
Write-Host "🚀 Memulai Aplikasi JASPEL..." -ForegroundColor Cyan
Write-Host ""

# Stop any running dev server
Write-Host "1. Menghentikan server yang berjalan..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next dev*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear cache
Write-Host "2. Membersihkan cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "   ✅ Cache dibersihkan" -ForegroundColor Green
}

# Start server
Write-Host ""
Write-Host "3. Memulai development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  APLIKASI SIAP!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🌐 URL: http://localhost:3002/login" -ForegroundColor White
Write-Host ""
Write-Host "  📧 Email: mukhsin9@gmail.com" -ForegroundColor White
Write-Host "  🔒 Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

npm run dev
