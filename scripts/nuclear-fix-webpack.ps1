# Nuclear fix untuk webpack chunk error yang persistent
Write-Host "=== NUCLEAR FIX: Webpack Chunk Error ===" -ForegroundColor Red
Write-Host "Ini akan membersihkan SEMUA cache dan rebuild dari nol`n" -ForegroundColor Yellow

# 1. Kill all node processes
Write-Host "1. Killing all Node.js processes..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Delete all cache directories
Write-Host "`n2. Deleting all cache directories..." -ForegroundColor Cyan
$cacheDirs = @(
    ".next",
    "node_modules/.cache",
    ".turbo",
    ".swc"
)

foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Write-Host "   Deleting $dir..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $dir -ErrorAction SilentlyContinue
        Write-Host "   ✓ $dir deleted" -ForegroundColor Green
    }
}

# 3. Clear npm cache
Write-Host "`n3. Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force
Write-Host "   ✓ npm cache cleared" -ForegroundColor Green

# 4. Reinstall dependencies (optional but recommended)
Write-Host "`n4. Do you want to reinstall node_modules? (Recommended)" -ForegroundColor Yellow
Write-Host "   This will take a few minutes but ensures clean state" -ForegroundColor Gray
$reinstall = Read-Host "   Reinstall? (y/n)"

if ($reinstall -eq "y") {
    Write-Host "`n   Deleting node_modules..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    
    Write-Host "   Running npm install..." -ForegroundColor Yellow
    npm install
    Write-Host "   ✓ Dependencies reinstalled" -ForegroundColor Green
}

# 5. Start fresh dev server
Write-Host "`n5. Starting fresh dev server..." -ForegroundColor Cyan
Write-Host "   Server akan start di http://localhost:3002" -ForegroundColor Green
Write-Host "   Tekan Ctrl+C untuk stop`n" -ForegroundColor Yellow

npm run dev
