# Manual Test untuk Sidebar dan Logout
Write-Host "=== TEST SIDEBAR DAN LOGOUT ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server sudah berjalan di: http://localhost:3002" -ForegroundColor Green
Write-Host ""
Write-Host "LANGKAH TESTING:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. LOGIN" -ForegroundColor Cyan
Write-Host "   - Buka: http://localhost:3002/login" -ForegroundColor White
Write-Host "   - Email: admin@jaspel.com" -ForegroundColor White
Write-Host "   - Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "2. CEK SIDEBAR" -ForegroundColor Cyan
Write-Host "   - Apakah sidebar terlihat di sebelah kiri?" -ForegroundColor White
Write-Host "   - Apakah semua menu tampil (Dashboard, Users, Units, KPI, Pool, dll)?" -ForegroundColor White
Write-Host "   - Apakah tidak ada overlap dengan konten utama?" -ForegroundColor White
Write-Host "   - Coba klik beberapa menu untuk navigasi" -ForegroundColor White
Write-Host ""
Write-Host "3. TEST LOGOUT" -ForegroundColor Cyan
Write-Host "   - Scroll ke bawah sidebar" -ForegroundColor White
Write-Host "   - Klik tombol 'Keluar' (warna merah)" -ForegroundColor White
Write-Host "   - Klik 'Ya, Keluar' pada dialog konfirmasi" -ForegroundColor White
Write-Host "   - Pastikan redirect ke /login" -ForegroundColor White
Write-Host ""
Write-Host "PERBAIKAN YANG SUDAH DILAKUKAN:" -ForegroundColor Yellow
Write-Host "   - Fixed margin mismatch (lg:ml-72 sesuai dengan w-72)" -ForegroundColor Green
Write-Host "   - Added padding dan container untuk layout lebih baik" -ForegroundColor Green
Write-Host "   - Logout sudah menggunakan authService.logout() yang lengkap" -ForegroundColor Green
Write-Host ""

# Open browser
Start-Process "http://localhost:3002/login"

Write-Host "Browser dibuka. Silakan lakukan testing manual." -ForegroundColor Cyan
Write-Host ""
Write-Host "Tekan Enter jika sudah selesai testing..." -ForegroundColor Yellow
Read-Host
