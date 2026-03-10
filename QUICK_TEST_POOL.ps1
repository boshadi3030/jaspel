Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QUICK TEST - POOL PAGE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Perbaikan RLS sudah diterapkan" -ForegroundColor Green
Write-Host ""

Write-Host "Instruksi Testing:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Buka browser dan akses: http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "2. Jika sudah login, LOGOUT terlebih dahulu" -ForegroundColor White
Write-Host "   (Klik menu Logout di sidebar)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Login ulang dengan kredensial superadmin:" -ForegroundColor White
Write-Host "   Email: mukhsin9@gmail.com" -ForegroundColor Gray
Write-Host "   Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Setelah login, klik menu 'Pool' di sidebar" -ForegroundColor White
Write-Host ""
Write-Host "5. Halaman pool seharusnya tampil tanpa error 500" -ForegroundColor White
Write-Host ""

Write-Host "Jika masih error:" -ForegroundColor Red
Write-Host "- Buka Developer Tools (F12)" -ForegroundColor Gray
Write-Host "- Lihat tab Console untuk error detail" -ForegroundColor Gray
Write-Host "- Lihat tab Network untuk request yang gagal" -ForegroundColor Gray
Write-Host "- Screenshot error dan laporkan" -ForegroundColor Gray
Write-Host ""

Write-Host "Tekan Enter untuk menutup..." -ForegroundColor Green
Read-Host
