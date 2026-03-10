Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST POOL & SETTINGS PAGES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Testing Pool Page..." -ForegroundColor Yellow
npx tsx scripts/test-pool-page.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Pool page test failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Testing Settings Page..." -ForegroundColor Yellow
npx tsx scripts/test-settings-page.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Settings page test failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Pool page: Ready" -ForegroundColor Green
Write-Host "  ✓ Settings page: Ready with logo upload" -ForegroundColor Green
Write-Host "  ✓ Storage bucket: Configured" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 You can now:" -ForegroundColor Cyan
Write-Host "  1. Access /pool to manage financial pools" -ForegroundColor White
Write-Host "  2. Access /settings to configure organization info and upload logo" -ForegroundColor White
Write-Host "  3. Logo uploads are limited to 2MB (JPG, PNG, SVG)" -ForegroundColor White
Write-Host ""
