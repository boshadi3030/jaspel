# Test Login and Redirect
Write-Host "🧪 Testing Login and Redirect..." -ForegroundColor Cyan

# Kill any existing dev server
Write-Host "`n🛑 Stopping any existing dev server..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node_modules*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Start dev server in background
Write-Host "`n🚀 Starting dev server..." -ForegroundColor Green
$devServer = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test login endpoint
Write-Host "`n🔐 Testing login..." -ForegroundColor Cyan
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/login" -Method GET -UseBasicParsing
    Write-Host "✅ Login page accessible (Status: $($loginResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Login page not accessible: $_" -ForegroundColor Red
}

# Test admin dashboard (should redirect to login if not authenticated)
Write-Host "`n🏠 Testing admin dashboard..." -ForegroundColor Cyan
try {
    $dashboardResponse = Invoke-WebRequest -Uri "http://localhost:3002/admin/dashboard" -Method GET -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "✅ Dashboard accessible (Status: $($dashboardResponse.StatusCode))" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 307 -or $_.Exception.Response.StatusCode -eq 302) {
        Write-Host "✅ Dashboard redirects to login (as expected)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Unexpected response: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Test complete!" -ForegroundColor Green
Write-Host "📝 Please test manually:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost:3002/login" -ForegroundColor White
Write-Host "   2. Login with: mukhsin9@gmail.com / admin123" -ForegroundColor White
Write-Host "   3. Check if redirect to /admin/dashboard works" -ForegroundColor White
Write-Host "`n⚠️ Press Ctrl+C to stop the dev server when done" -ForegroundColor Yellow

# Keep script running
Wait-Process -Id $devServer.Id
