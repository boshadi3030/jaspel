Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST POOL EDIT FUNCTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Testing edit function..." -ForegroundColor Yellow
npx tsx scripts/test-pool-edit-function.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  EDIT FUNCTION TEST PASSED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Cara menggunakan fitur edit:" -ForegroundColor Cyan
    Write-Host "1. Buka browser: http://localhost:3002/pool" -ForegroundColor White
    Write-Host "2. Klik tombol 'Lihat' pada pool dengan status DRAFT" -ForegroundColor White
    Write-Host "3. Pada item pendapatan/potongan, klik icon pensil (Edit)" -ForegroundColor White
    Write-Host "4. Form akan terisi dengan data item tersebut" -ForegroundColor White
    Write-Host "5. Ubah deskripsi atau jumlah sesuai kebutuhan" -ForegroundColor White
    Write-Host "6. Klik tombol 'Simpan' untuk menyimpan perubahan" -ForegroundColor White
    Write-Host "7. Klik tombol 'Batal' untuk membatalkan edit" -ForegroundColor White
    Write-Host ""
    Write-Host "Fitur yang tersedia:" -ForegroundColor Cyan
    Write-Host "- Edit item pendapatan (icon pensil biru)" -ForegroundColor White
    Write-Host "- Edit item potongan (icon pensil biru)" -ForegroundColor White
    Write-Host "- Hapus item (icon tempat sampah merah)" -ForegroundColor White
    Write-Host "- Tombol berubah dari 'Tambah' ke 'Simpan' saat edit" -ForegroundColor White
    Write-Host "- Tombol 'Batal' muncul saat mode edit" -ForegroundColor White
    Write-Host ""
    Write-Host "Catatan:" -ForegroundColor Yellow
    Write-Host "- Hanya pool dengan status DRAFT yang bisa diedit" -ForegroundColor White
    Write-Host "- Pool yang sudah disetujui hanya bisa dilihat (read-only)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  TEST FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Periksa error di atas dan coba lagi." -ForegroundColor Yellow
}
