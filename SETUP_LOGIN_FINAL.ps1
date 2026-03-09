# Setup Login - Final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SETUP LOGIN FINAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create users in Supabase Auth
Write-Host "[1/3] Creating users in Supabase Auth..." -ForegroundColor Yellow
npx tsx scripts/create-test-users.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to create users" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Test login
Write-Host "[2/3] Testing login..." -ForegroundColor Yellow
npx tsx scripts/test-direct-login.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Login test failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Show credentials
Write-Host "[3/3] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "LOGIN CREDENTIALS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Superadmin:" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "  Dashboard: /admin/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "Unit Manager:" -ForegroundColor Cyan
Write-Host "  Email: john.doe@example.com" -ForegroundColor White
Write-Host "  Password: manager123" -ForegroundColor White
Write-Host "  Dashboard: /manager/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "Employee:" -ForegroundColor Cyan
Write-Host "  Email: jane.smith@example.com" -ForegroundColor White
Write-Host "  Password: employee123" -ForegroundColor White
Write-Host "  Dashboard: /employee/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "NEXT STEPS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host "2. Open: http://localhost:3000/login" -ForegroundColor Yellow
Write-Host "3. Login with credentials above" -ForegroundColor Yellow
Write-Host "4. Should redirect to dashboard in ~2 seconds" -ForegroundColor Yellow
Write-Host ""
Write-Host "TIP: Use Incognito mode for clean testing!" -ForegroundColor Cyan
Write-Host ""
