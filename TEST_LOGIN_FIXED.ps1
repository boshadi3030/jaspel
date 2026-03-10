Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  JASPEL - Test Login (Fixed)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Stopping any running dev servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node_modules*" } | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "2. Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "   ✓ Cache cleared" -ForegroundColor Green
}

Write-Host "3. Starting dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Server akan berjalan di:" -ForegroundColor Green
Write-Host "  http://localhost:3002" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Kredensial login:" -ForegroundColor Cyan
Write-Host "  Email: mukhsin9@gmail.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Tekan Ctrl+C untuk stop server" -ForegroundColor Yellow
Write-Host ""

npm run dev
