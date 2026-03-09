Write-Host "🔧 Memperbaiki masalah login..." -ForegroundColor Cyan
Write-Host ""

# Stop any running dev server
Write-Host "1. Menghentikan dev server yang berjalan..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear Next.js cache
Write-Host "2. Membersihkan cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   ✅ Cache .next dihapus" -ForegroundColor Green
}

# Clear node_modules/.cache if exists
Write-Host "3. Membersihkan cache node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "   ✅ Cache node_modules dihapus" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Testing login dari backend..." -ForegroundColor Yellow
npx tsx scripts/test-login-detailed.ts

Write-Host ""
Write-Host "5. Memulai dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 INSTRUKSI PENTING:" -ForegroundColor Cyan
Write-Host "   1. Buka browser dalam mode INCOGNITO/PRIVATE" -ForegroundColor White
Write-Host "   2. Buka http://localhost:3002/login" -ForegroundColor White
Write-Host "   3. Login dengan: mukhsin9@gmail.com / admin123" -ForegroundColor White
Write-Host "   4. Buka Developer Console (F12) untuk melihat error jika ada" -ForegroundColor White
Write-Host ""
Write-Host "Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Yellow
Write-Host ""

npm run dev
