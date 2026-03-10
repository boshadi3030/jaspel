Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST HALAMAN POOL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Testing RLS policies dan akses pool..." -ForegroundColor Yellow
npx tsx scripts/test-pool-access.ts

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  INSTRUKSI MANUAL TEST" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Silakan lakukan test manual berikut:" -ForegroundColor White
Write-Host ""
Write-Host "1. Buka browser dan akses: http://localhost:3000/login" -ForegroundColor White
Write-Host "   - Email: admin@example.com" -ForegroundColor Gray
Write-Host "   - Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Setelah login, akses halaman pool:" -ForegroundColor White
Write-Host "   http://localhost:3000/pool" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Verifikasi fitur berikut:" -ForegroundColor White
Write-Host "   [✓] Halaman pool terbuka tanpa error 500" -ForegroundColor Gray
Write-Host "   [✓] Tombol 'Buat Pool' berfungsi" -ForegroundColor Gray
Write-Host "   [✓] Dapat membuat pool baru" -ForegroundColor Gray
Write-Host "   [✓] Dapat melihat detail pool" -ForegroundColor Gray
Write-Host "   [✓] Dapat menambah item pendapatan" -ForegroundColor Gray
Write-Host "   [✓] Dapat menambah item potongan" -ForegroundColor Gray
Write-Host "   [✓] Dapat menyetujui pool" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  PERBAIKAN YANG DILAKUKAN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "[✓] Menambahkan RLS policy untuk superadmin" -ForegroundColor Green
Write-Host "[✓] Superadmin dapat mengakses semua pool (draft/approved/distributed)" -ForegroundColor Green
Write-Host "[✓] Superadmin dapat mengelola pool revenue dan deduction" -ForegroundColor Green
Write-Host "[✓] Unit manager dapat melihat pool yang sudah approved" -ForegroundColor Green
Write-Host ""
