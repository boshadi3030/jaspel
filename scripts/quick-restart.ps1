# Quick Restart with Clean Cache
Write-Host "🔄 Quick Restart..." -ForegroundColor Cyan

# Kill node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Clear .next only
Write-Host "Clearing .next cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Start with turbo (faster)
Write-Host "Starting with Turbo mode..." -ForegroundColor Green
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
