# Fix untuk webpack dev overlay error
Write-Host "Fixing webpack dev overlay error..." -ForegroundColor Cyan

# 1. Stop dev server
Write-Host "`n1. Stopping dev server..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -like "*next dev*" 
} | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Clear semua cache
Write-Host "`n2. Clearing all caches..." -ForegroundColor Yellow

if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   .next cleared" -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "   node_modules/.cache cleared" -ForegroundColor Green
}

# Clear Windows temp untuk Next.js
$nextTempPath = "$env:TEMP\next-*"
if (Test-Path $nextTempPath) {
    Remove-Item -Recurse -Force $nextTempPath -ErrorAction SilentlyContinue
    Write-Host "   Windows temp cleared" -ForegroundColor Green
}

# 3. Reinstall dependencies (optional tapi recommended)
Write-Host "`n3. Do you want to reinstall node_modules? (y/n)" -ForegroundColor Yellow
$reinstall = Read-Host
if ($reinstall -eq "y") {
    Write-Host "   Removing node_modules..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    
    Write-Host "   Running npm install..." -ForegroundColor Cyan
    npm install
}

# 4. Start fresh dev server
Write-Host "`n4. Starting fresh dev server..." -ForegroundColor Yellow
Write-Host "   Server akan start di http://localhost:3002" -ForegroundColor Green
Write-Host "   Tekan Ctrl+C untuk stop`n" -ForegroundColor Yellow

npm run dev
