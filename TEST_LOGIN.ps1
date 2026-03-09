Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST LOGIN SISTEM JASPEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Verifikasi login flow..." -ForegroundColor Yellow
npx tsx scripts/verify-login-complete.ts

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SELESAI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Kredensial untuk testing:" -ForegroundColor Cyan
Write-Host "  Email    : mukhsin9@gmail.com" -ForegroundColor White
Write-Host "  Password : admin123" -ForegroundColor White
Write-Host ""
Write-Host "Atau:" -ForegroundColor Cyan
Write-Host "  Email    : admin@example.com" -ForegroundColor White
Write-Host "  Password : admin123" -ForegroundColor White
Write-Host ""
Write-Host "Jalankan dev server dengan: npm run dev" -ForegroundColor Yellow
Write-Host "Lalu buka: http://localhost:3000/login" -ForegroundColor Yellow
