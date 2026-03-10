# Fix Webpack and Module Errors
Write-Host "=== Memperbaiki Webpack dan Module Errors ===" -ForegroundColor Cyan

# Stop any running dev server
Write-Host "`n1. Menghentikan dev server yang berjalan..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean cache and build artifacts
Write-Host "`n2. Membersihkan cache dan build artifacts..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✓ .next folder dihapus" -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "   ✓ node_modules/.cache dihapus" -ForegroundColor Green
}

# Reinstall dependencies
Write-Host "`n3. Reinstall dependencies..." -ForegroundColor Yellow
Write-Host "   Menghapus node_modules..." -ForegroundColor Gray
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

Write-Host "   Menghapus package-lock.json..." -ForegroundColor Gray
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

Write-Host "   Menginstall ulang dependencies (ini akan memakan waktu)..." -ForegroundColor Gray
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Dependencies berhasil diinstall" -ForegroundColor Green
} else {
    Write-Host "   ✗ Gagal install dependencies" -ForegroundColor Red
    exit 1
}

# Verify critical packages
Write-Host "`n4. Memverifikasi package kritis..." -ForegroundColor Yellow
$criticalPackages = @("autoprefixer", "postcss", "tailwindcss", "next")
$allPresent = $true

foreach ($pkg in $criticalPackages) {
    if (Test-Path "node_modules/$pkg") {
        Write-Host "   ✓ $pkg" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $pkg MISSING" -ForegroundColor Red
        $allPresent = $false
    }
}

if (-not $allPresent) {
    Write-Host "`n   Mencoba install package yang hilang..." -ForegroundColor Yellow
    npm install autoprefixer postcss tailwindcss --save-dev
}

# Start dev server
Write-Host "`n5. Memulai dev server..." -ForegroundColor Yellow
Write-Host "   Server akan berjalan di http://localhost:3002" -ForegroundColor Cyan
Write-Host "   Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Gray
Write-Host ""

npm run dev
