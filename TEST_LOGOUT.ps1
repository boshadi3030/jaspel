Write-Host "Testing Logout Functionality..." -ForegroundColor Cyan
Write-Host ""

# Install playwright if needed
Write-Host "Checking Playwright installation..." -ForegroundColor Yellow
npx playwright install chromium --with-deps

Write-Host ""
Write-Host "Running logout test..." -ForegroundColor Yellow
npx tsx scripts/test-logout.ts

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green
