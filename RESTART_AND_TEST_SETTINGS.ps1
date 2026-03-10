Write-Host "Restarting dev server and testing settings..." -ForegroundColor Cyan

# Kill any existing node processes
Write-Host "`nStopping existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start dev server in background
Write-Host "`nStarting dev server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

# Wait for server to start
Write-Host "`nWaiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test settings endpoint
Write-Host "`nTesting settings endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/settings" -UseBasicParsing
    Write-Host "✓ Settings API working!" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✗ Settings API error: $_" -ForegroundColor Red
}

Write-Host "`n`nNow open browser: http://localhost:3002/settings" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
