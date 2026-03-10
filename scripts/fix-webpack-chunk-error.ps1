# Quick fix untuk webpack chunk loading error
Write-Host "Fixing webpack chunk loading error..." -ForegroundColor Cyan

# 1. Stop dev server jika masih running
Write-Host "`n1. Stopping any running dev servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next dev*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Clear Next.js cache
Write-Host "`n2. Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   .next folder deleted" -ForegroundColor Green
}

# 3. Clear node_modules/.cache
Write-Host "`n3. Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "   node_modules/.cache deleted" -ForegroundColor Green
}

# 4. Start fresh dev server
Write-Host "`n4. Starting fresh dev server..." -ForegroundColor Yellow
Write-Host "   Running: npm run dev" -ForegroundColor Cyan
Write-Host "`nServer akan start di http://localhost:3002" -ForegroundColor Green
Write-Host "Tekan Ctrl+C untuk stop server`n" -ForegroundColor Yellow

npm run dev
