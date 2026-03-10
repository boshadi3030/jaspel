Write-Host "🔧 Memperbaiki Sidebar Navigation" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Stop any running dev server
Write-Host "1️⃣ Menghentikan server yang berjalan..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node_modules*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Clear .next build cache
Write-Host "2️⃣ Membersihkan cache build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   ✅ Cache .next dihapus" -ForegroundColor Green
}

# 3. Verify structure
Write-Host "3️⃣ Memverifikasi struktur..." -ForegroundColor Yellow
npx tsx scripts/quick-test-sidebar.ts

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Perbaikan selesai!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Yang sudah diperbaiki:" -ForegroundColor Cyan
Write-Host "   - Semua halaman dipindahkan ke folder (authenticated)" -ForegroundColor White
Write-Host "   - Layout authenticated sudah include Sidebar" -ForegroundColor White
Write-Host "   - Margin konten sudah disesuaikan (lg:ml-72)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Langkah selanjutnya:" -ForegroundColor Cyan
Write-Host "   1. Jalankan: npm run dev" -ForegroundColor Yellow
Write-Host "   2. Buka browser: http://localhost:3002" -ForegroundColor Yellow
Write-Host "   3. Clear cache browser (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host "   4. Login dengan kredensial Anda" -ForegroundColor Yellow
Write-Host "   5. Sidebar akan muncul! 🎉" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Tip: Jika sidebar masih belum muncul, coba:" -ForegroundColor Cyan
Write-Host "   - Hard refresh browser (Ctrl+F5)" -ForegroundColor White
Write-Host "   - Buka di incognito/private window" -ForegroundColor White
Write-Host ""
