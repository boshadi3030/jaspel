# Test aplikasi setelah fix webpack chunk error
Write-Host "=== Testing Aplikasi Setelah Fix ===" -ForegroundColor Cyan

Write-Host "`nMemulai dev server..." -ForegroundColor Yellow
Write-Host "Tekan Ctrl+C untuk stop server" -ForegroundColor Gray
Write-Host "`nBuka browser ke: http://localhost:3000" -ForegroundColor Green
Write-Host "Login dengan: superadmin / Admin123!" -ForegroundColor Green

npm run dev
