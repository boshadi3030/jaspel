# Script untuk test login flow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST LOGIN FLOW" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Memulai test..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Check if server is running
Write-Host "[Test 1/5] Checking server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://192.168.1.5:3000" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Server is running" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Server is not running!" -ForegroundColor Red
    Write-Host "  Please start server first: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check login page
Write-Host ""
Write-Host "[Test 2/5] Checking login page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://192.168.1.5:3000/login" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200 -and $response.Content -match "JASPEL System") {
        Write-Host "✓ Login page is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Login page error!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 3: Check environment variables
Write-Host ""
Write-Host "[Test 3/5] Checking environment..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    $hasUrl = $envContent -match "NEXT_PUBLIC_SUPABASE_URL=https://"
    $hasKey = $envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ"
    
    if ($hasUrl -and $hasKey) {
        Write-Host "✓ Environment variables are set" -ForegroundColor Green
    } else {
        Write-Host "✗ Environment variables incomplete!" -ForegroundColor Red
        if (-not $hasUrl) { Write-Host "  Missing: NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Yellow }
        if (-not $hasKey) { Write-Host "  Missing: NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow }
    }
} else {
    Write-Host "✗ .env.local not found!" -ForegroundColor Red
}

# Test 4: Check middleware
Write-Host ""
Write-Host "[Test 4/5] Checking middleware..." -ForegroundColor Yellow
if (Test-Path "middleware.ts") {
    $middlewareContent = Get-Content "middleware.ts" -Raw
    $hasCache = $middlewareContent -match "sessionCache"
    $hasTimeout = $middlewareContent -match "Promise.race"
    
    if ($hasCache -and $hasTimeout) {
        Write-Host "✓ Middleware has caching and timeout" -ForegroundColor Green
    } else {
        Write-Host "⚠ Middleware might need update" -ForegroundColor Yellow
        if (-not $hasCache) { Write-Host "  Missing: Session cache" -ForegroundColor Yellow }
        if (-not $hasTimeout) { Write-Host "  Missing: Timeout protection" -ForegroundColor Yellow }
    }
} else {
    Write-Host "✗ middleware.ts not found!" -ForegroundColor Red
}

# Test 5: Check login page updates
Write-Host ""
Write-Host "[Test 5/5] Checking login page updates..." -ForegroundColor Yellow
if (Test-Path "app/login/page.tsx") {
    $loginContent = Get-Content "app/login/page.tsx" -Raw
    $hasRedirectState = $loginContent -match "isRedirecting"
    $hasSessionCheck = $loginContent -match "checkExistingSession"
    
    if ($hasRedirectState -and $hasSessionCheck) {
        Write-Host "✓ Login page has all fixes" -ForegroundColor Green
    } else {
        Write-Host "⚠ Login page might need update" -ForegroundColor Yellow
        if (-not $hasRedirectState) { Write-Host "  Missing: Redirect state" -ForegroundColor Yellow }
        if (-not $hasSessionCheck) { Write-Host "  Missing: Session check" -ForegroundColor Yellow }
    }
} else {
    Write-Host "✗ app/login/page.tsx not found!" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "MANUAL TEST STEPS:" -ForegroundColor Yellow
Write-Host "1. Open: http://192.168.1.5:3000/login" -ForegroundColor White
Write-Host "2. Open DevTools (F12) > Console tab" -ForegroundColor White
Write-Host "3. Login with: mukhsin9@gmail.com / admin123" -ForegroundColor White
Write-Host "4. Watch console logs for:" -ForegroundColor White
Write-Host "   - [Login] Starting login process..." -ForegroundColor Gray
Write-Host "   - [Login] ✓ Sign in successful" -ForegroundColor Gray
Write-Host "   - [Login] ✓ Employee found" -ForegroundColor Gray
Write-Host "   - [Login] ✓ Login complete, redirecting to..." -ForegroundColor Gray
Write-Host "   - [Supabase Client] Cookie set: ... verified: true" -ForegroundColor Gray
Write-Host "5. Should redirect to /admin/dashboard" -ForegroundColor White
Write-Host "6. Should NOT loop back to login" -ForegroundColor White
Write-Host ""
Write-Host "EXPECTED BEHAVIOR:" -ForegroundColor Yellow
Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host "✓ Redirect to dashboard" -ForegroundColor Green
Write-Host "✓ No login loop" -ForegroundColor Green
Write-Host "✓ Session persists on refresh" -ForegroundColor Green
Write-Host ""
Write-Host "If you see login loop:" -ForegroundColor Yellow
Write-Host "1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "2. Clear localStorage in DevTools" -ForegroundColor White
Write-Host "3. Restart server" -ForegroundColor White
Write-Host "4. Try again" -ForegroundColor White
Write-Host ""
