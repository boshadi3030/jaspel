Write-Host "==================================" -ForegroundColor Cyan
Write-Host "TEST POOL PAGE SETELAH PERBAIKAN RLS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Perbaikan yang dilakukan:" -ForegroundColor Yellow
Write-Host "1. Fungsi is_superadmin() diperbaiki untuk menggunakan auth.users.user_metadata" -ForegroundColor White
Write-Host "2. Fungsi is_unit_manager() diperbaiki untuk menggunakan auth.users.user_metadata" -ForegroundColor White
Write-Host "3. Fungsi is_employee() dibuat untuk menggunakan auth.users.user_metadata" -ForegroundColor White
Write-Host ""

Write-Host "Langkah testing:" -ForegroundColor Yellow
Write-Host "1. Pastikan dev server berjalan (npm run dev)" -ForegroundColor White
Write-Host "2. Buka browser dan login sebagai superadmin" -ForegroundColor White
Write-Host "3. Akses halaman: http://localhost:3002/pool" -ForegroundColor White
Write-Host "4. Halaman seharusnya tampil tanpa error 500" -ForegroundColor White
Write-Host ""

Write-Host "Jika masih error, cek:" -ForegroundColor Yellow
Write-Host "- Browser console untuk error detail" -ForegroundColor White
Write-Host "- Network tab untuk melihat request yang gagal" -ForegroundColor White
Write-Host "- Pastikan sudah logout dan login ulang" -ForegroundColor White
Write-Host ""

Write-Host "Tekan Enter untuk melanjutkan..." -ForegroundColor Green
Read-Host
