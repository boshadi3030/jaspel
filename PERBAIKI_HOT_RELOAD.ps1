# Script untuk memperbaiki hot reload error
Write-Host "🔧 Memperbaiki Hot Reload Error..." -ForegroundColor Cyan
Write-Host ""

# Stop any running dev server
Write-Host "1. Menghentikan dev server yang berjalan..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next dev*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear Next.js cache
Write-Host "2. Membersihkan cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "   ✅ Cache .next dihapus" -ForegroundColor Green
}

# Clear node_modules/.cache
Write-Host "3. Membersihkan node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force
    Write-Host "   ✅ node_modules/.cache dihapus" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Pembersihan selesai!" -ForegroundColor Green
Write-Host ""
Write-Host "Sekarang jalankan:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Jika masih ada error, coba:" -ForegroundColor Yellow
Write-Host "  1. Tutup semua tab browser yang membuka localhost:3002" -ForegroundColor White
Write-Host "  2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "  3. Restart browser" -ForegroundColor White
Write-Host "  4. Buka kembali http://localhost:3002/login" -ForegroundColor White
