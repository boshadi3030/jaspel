Write-Host "🔧 Testing Sidebar Fix..." -ForegroundColor Cyan
Write-Host ""

# Kill any existing Next.js processes
Write-Host "⏹️  Stopping existing dev server..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node_modules*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# Start dev server in background
Write-Host "🚀 Starting dev server..." -ForegroundColor Green
$devServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -PassThru -WindowStyle Minimized

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Open browser
Write-Host "🌐 Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3002/admin/dashboard"

Write-Host ""
Write-Host "✅ Server started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Cyan
Write-Host "1. Login dengan: mukhsin9@gmail.com / password123" -ForegroundColor White
Write-Host "2. Buka browser console (F12)" -ForegroundColor White
Write-Host "3. Periksa log debug untuk sidebar" -ForegroundColor White
Write-Host "4. Periksa apakah sidebar tampil" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to stop server..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop server
Write-Host "⏹️  Stopping server..." -ForegroundColor Yellow
Stop-Process -Id $devServer.Id -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node_modules*" } | Stop-Process -Force

Write-Host "✅ Done!" -ForegroundColor Green
