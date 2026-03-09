Write-Host "=== TEST SIDEBAR SETELAH PERBAIKAN ===" -ForegroundColor Cyan
Write-Host ""

# Test menu items
Write-Host "Testing menu items..." -ForegroundColor Yellow
npx tsx scripts/test-sidebar-rendering.ts

Write-Host ""
Write-Host "Testing sidebar visual..." -ForegroundColor Yellow
npx tsx scripts/test-sidebar-visual.ts

Write-Host ""
Write-Host "=== PERBAIKAN SELESAI ===" -ForegroundColor Green
Write-Host ""
Write-Host "Masalah yang diperbaiki:" -ForegroundColor Cyan
Write-Host "1. Duplikasi fungsi getRoleBadge di Sidebar.tsx" -ForegroundColor White
Write-Host "2. Error TypeScript yang menyebabkan komponen tidak render" -ForegroundColor White
Write-Host ""
Write-Host "Untuk melihat hasilnya:" -ForegroundColor Cyan
Write-Host "1. Jalankan: npm run dev" -ForegroundColor Yellow
Write-Host "2. Buka browser: http://localhost:3002" -ForegroundColor Yellow
Write-Host "3. Login dengan user Anda" -ForegroundColor Yellow
Write-Host "4. Sidebar sekarang akan menampilkan teks menu dengan jelas" -ForegroundColor Yellow
Write-Host ""
