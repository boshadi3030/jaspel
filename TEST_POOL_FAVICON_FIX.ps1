Write-Host "=== Testing Pool Page and Favicon Fix ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Starting development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized

Write-Host "   Waiting for server to start..." -ForegroundColor Gray
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "2. Opening pool page in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3002/pool"

Write-Host ""
Write-Host "=== Test Instructions ===" -ForegroundColor Green
Write-Host "1. Check if the page loads without 500 error"
Write-Host "2. Check if favicon loads without 401 error (check Network tab)"
Write-Host "3. Verify pool table displays correctly"
Write-Host "4. Try creating a new pool"
Write-Host ""
Write-Host "Press any key to stop the server..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Stopping server..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*Next.js*" } | Stop-Process -Force
