Write-Host "Opening Pool Management page..." -ForegroundColor Cyan
Start-Process "http://localhost:3002/pool"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TESTING EDIT FUNCTION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Langkah testing:" -ForegroundColor Yellow
Write-Host "1. Login sebagai superadmin" -ForegroundColor White
Write-Host "2. Klik 'Lihat' pada pool DRAFT" -ForegroundColor White
Write-Host "3. Klik icon pensil (biru) pada item pendapatan/potongan" -ForegroundColor White
Write-Host "4. Form akan terisi otomatis" -ForegroundColor White
Write-Host "5. Ubah nilai dan klik 'Simpan'" -ForegroundColor White
Write-Host "6. Verifikasi perubahan tersimpan" -ForegroundColor White
Write-Host ""
