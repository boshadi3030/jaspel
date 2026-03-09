Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  JASPEL - Test Logout Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Running logout test..." -ForegroundColor Yellow
Write-Host ""

npx tsx scripts/test-logout-fix.ts

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If test passed, try logout in browser" -ForegroundColor White
Write-Host "2. Login to the application" -ForegroundColor White
Write-Host "3. Click 'Keluar' button in sidebar" -ForegroundColor White
Write-Host "4. Confirm logout in dialog" -ForegroundColor White
Write-Host "5. Verify you are redirected to login page" -ForegroundColor White
Write-Host "6. Try accessing protected pages directly" -ForegroundColor White
Write-Host "   (should redirect to login)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
