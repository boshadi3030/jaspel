# Quick Fix for Webpack Errors (tanpa reinstall penuh)
Write-Host "=== Quick Fix Webpack Errors ===" -ForegroundColor Cyan

# Stop dev server
Write-Host "`n1. Menghentikan dev server..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clean build artifacts only
Write-Host "`n2. Membersihkan build artifacts..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✓ .next dihapus" -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "   ✓ cache dihapus" -ForegroundColor Green
}

# Verify and fix autoprefixer
Write-Host "`n3. Memverifikasi autoprefixer..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules/autoprefixer")) {
    Write-Host "   Installing autoprefixer..." -ForegroundColor Gray
    npm install autoprefixer --save-dev --legacy-peer-deps
} else {
    Write-Host "   ✓ autoprefixer ada" -ForegroundColor Green
}

# Verify postcss
if (-not (Test-Path "node_modules/postcss")) {
    Write-Host "   Installing postcss..." -ForegroundColor Gray
    npm install postcss --save-dev --legacy-peer-deps
} else {
    Write-Host "   ✓ postcss ada" -ForegroundColor Green
}

# Clear npm cache
Write-Host "`n4. Membersihkan npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "   ✓ Cache dibersihkan" -ForegroundColor Green

# Start server
Write-Host "`n5. Memulai dev server..." -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""

npm run dev
