Write-Host "=== Test Tombol Halaman Units ===" -ForegroundColor Cyan
Write-Host ""

# Jalankan test script
npx tsx scripts/test-units-buttons.ts

Write-Host ""
Write-Host "Untuk melihat hasil perbaikan:" -ForegroundColor Yellow
Write-Host "1. Jalankan: npm run dev" -ForegroundColor White
Write-Host "2. Login sebagai superadmin" -ForegroundColor White
Write-Host "3. Buka halaman Units" -ForegroundColor White
Write-Host "4. Verifikasi tombol sudah sesuai dengan gambar" -ForegroundColor White
