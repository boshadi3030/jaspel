Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PERBAIKI ERROR 500 SETTINGS PAGE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Menghentikan dev server jika berjalan..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Membersihkan cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Cache .next dihapus" -ForegroundColor Green
}

Write-Host ""
Write-Host "Membersihkan node_modules/.cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✅ Cache node_modules dihapus" -ForegroundColor Green
}

Write-Host ""
Write-Host "Menjalankan diagnosis..." -ForegroundColor Yellow
npx tsx scripts/diagnose-settings-error.ts

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LANGKAH SELANJUTNYA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Jalankan dev server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Buka browser dan akses:" -ForegroundColor White
Write-Host "   http://localhost:3002/settings" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Jika masih error 500, cek console browser (F12)" -ForegroundColor White
Write-Host "   untuk melihat error detail" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Jika masih bermasalah, coba:" -ForegroundColor White
Write-Host "   - Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor Gray
Write-Host "   - Buka incognito/private window" -ForegroundColor Gray
Write-Host "   - Restart browser" -ForegroundColor Gray
Write-Host ""
