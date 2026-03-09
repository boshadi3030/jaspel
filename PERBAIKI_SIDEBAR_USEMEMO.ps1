Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PERBAIKAN SIDEBAR USEMEMO ERROR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 Menjalankan test perbaikan..." -ForegroundColor Yellow
npx tsx scripts/test-sidebar-usememo-fix.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Test berhasil!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Memulai development server..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Catatan:" -ForegroundColor Cyan
    Write-Host "   - Sidebar sekarang memiliki import useMemo yang lengkap" -ForegroundColor White
    Write-Host "   - Dashboard tidak lagi menggunakan timeout yang ketat" -ForegroundColor White
    Write-Host "   - Diagnostic code telah dihapus dari Sidebar" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Setelah server berjalan:" -ForegroundColor Cyan
    Write-Host "   1. Buka http://localhost:3000" -ForegroundColor White
    Write-Host "   2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
    Write-Host "   3. Login dan test sidebar navigation" -ForegroundColor White
    Write-Host "   4. Periksa console browser untuk memastikan tidak ada error" -ForegroundColor White
    Write-Host ""
    
    npm run dev
} else {
    Write-Host ""
    Write-Host "❌ Test gagal. Periksa error di atas." -ForegroundColor Red
    Write-Host ""
    exit 1
}
