# Quick Fix ChunkLoadError (Tanpa Reinstall Dependencies)
# Untuk Next.js 15 di Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QUICK FIX CHUNK LOAD ERROR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all Node processes
Write-Host "[1/4] Stopping Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ Stopped" -ForegroundColor Green
} catch {
    Write-Host "✓ No processes running" -ForegroundColor Green
}
Start-Sleep -Seconds 1

# Step 2: Delete .next folder
Write-Host ""
Write-Host "[2/4] Deleting .next cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Deleted" -ForegroundColor Green
} else {
    Write-Host "✓ Already clean" -ForegroundColor Green
}

# Step 3: Clear npm cache
Write-Host ""
Write-Host "[3/4] Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "✓ Cleared" -ForegroundColor Green

# Step 4: Start dev server
Write-Host ""
Write-Host "[4/4] Starting dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  READY! Clear browser cache & refresh" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

npm run dev
