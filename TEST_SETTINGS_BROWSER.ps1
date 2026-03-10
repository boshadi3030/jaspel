Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SETTINGS PAGE IN BROWSER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Instruksi:" -ForegroundColor Yellow
Write-Host "1. Pastikan dev server sudah running (npm run dev)" -ForegroundColor White
Write-Host "2. Login ke aplikasi sebagai superadmin" -ForegroundColor White
Write-Host "3. Buka halaman Settings" -ForegroundColor White
Write-Host "4. Buka Developer Console (F12)" -ForegroundColor White
Write-Host "5. Periksa tab Console untuk error" -ForegroundColor White
Write-Host "6. Periksa tab Network untuk request yang gagal" -ForegroundColor White
Write-Host ""

Write-Host "Membuka browser..." -ForegroundColor Green
Start-Process "http://localhost:3002/login"

Write-Host ""
Write-Host "Kredensial Login:" -ForegroundColor Yellow
Write-Host "Email: admin@example.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host ""

Write-Host "Setelah login, navigasi ke Settings dan periksa console untuk error." -ForegroundColor Yellow
Write-Host ""
