Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SETTINGS & LOGO UPLOAD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing settings page and logo upload functionality..." -ForegroundColor Yellow
Write-Host ""

npx tsx scripts/test-settings-logo-upload.ts

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CARA MENGGUNAKAN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Jalankan dev server: npm run dev" -ForegroundColor White
Write-Host "2. Login sebagai superadmin" -ForegroundColor White
Write-Host "3. Buka halaman Settings" -ForegroundColor White
Write-Host "4. Upload logo (max 2MB, format: JPG/PNG/SVG)" -ForegroundColor White
Write-Host "5. Isi konfigurasi lainnya:" -ForegroundColor White
Write-Host "   - Informasi Organisasi" -ForegroundColor Gray
Write-Host "   - Konfigurasi Pajak PPh 21" -ForegroundColor Gray
Write-Host "   - Parameter Perhitungan" -ForegroundColor Gray
Write-Host "   - Teks Footer" -ForegroundColor Gray
Write-Host "6. Klik 'Simpan Pengaturan'" -ForegroundColor White
Write-Host ""
