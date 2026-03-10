# ============================================
# PERBAIKAN WEBPACK DAN MODULE ERROR
# ============================================
# Error yang diperbaiki:
# 1. Cannot find module 'autoprefixer'
# 2. Cannot find module 'next-flight-client-entry-loader'
# 3. Build error dan 500 Internal Server Error
# ============================================

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PERBAIKAN WEBPACK & MODULE ERROR         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Pilihan perbaikan
Write-Host "Pilih metode perbaikan:" -ForegroundColor Yellow
Write-Host "1. Quick Fix (hanya bersihkan cache - 1 menit)" -ForegroundColor White
Write-Host "2. Full Fix (reinstall dependencies - 5-10 menit)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Pilihan (1/2)"

if ($choice -eq "2") {
    Write-Host "`n=== FULL FIX MODE ===" -ForegroundColor Cyan
    
    # Stop server
    Write-Host "`nStep 1/6: Menghentikan dev server..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✓ Server dihentikan" -ForegroundColor Green
    
    # Clean everything
    Write-Host "`nStep 2/6: Membersihkan semua cache dan build..." -ForegroundColor Yellow
    if (Test-Path ".next") { Remove-Item -Recurse -Force .next }
    if (Test-Path "node_modules/.cache") { Remove-Item -Recurse -Force node_modules/.cache }
    if (Test-Path "node_modules") { Remove-Item -Recurse -Force node_modules }
    if (Test-Path "package-lock.json") { Remove-Item -Force package-lock.json }
    Write-Host "✓ Semua cache dibersihkan" -ForegroundColor Green
    
    # Clean npm cache
    Write-Host "`nStep 3/6: Membersihkan npm cache..." -ForegroundColor Yellow
    npm cache clean --force
    Write-Host "✓ NPM cache dibersihkan" -ForegroundColor Green
    
    # Reinstall
    Write-Host "`nStep 4/6: Menginstall dependencies..." -ForegroundColor Yellow
    Write-Host "   (Ini akan memakan waktu 5-10 menit)" -ForegroundColor Gray
    npm install --legacy-peer-deps
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Gagal install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies terinstall" -ForegroundColor Green
    
    # Verify
    Write-Host "`nStep 5/6: Memverifikasi package kritis..." -ForegroundColor Yellow
    $packages = @("autoprefixer", "postcss", "tailwindcss", "next", "react")
    foreach ($pkg in $packages) {
        if (Test-Path "node_modules/$pkg") {
            Write-Host "   ✓ $pkg" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $pkg MISSING!" -ForegroundColor Red
        }
    }
    
} else {
    Write-Host "`n=== QUICK FIX MODE ===" -ForegroundColor Cyan
    
    # Stop server
    Write-Host "`nStep 1/5: Menghentikan dev server..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✓ Server dihentikan" -ForegroundColor Green
    
    # Clean build only
    Write-Host "`nStep 2/5: Membersihkan build artifacts..." -ForegroundColor Yellow
    if (Test-Path ".next") { 
        Remove-Item -Recurse -Force .next 
        Write-Host "   ✓ .next dihapus" -ForegroundColor Green
    }
    if (Test-Path "node_modules/.cache") { 
        Remove-Item -Recurse -Force node_modules/.cache 
        Write-Host "   ✓ cache dihapus" -ForegroundColor Green
    }
    
    # Verify critical packages
    Write-Host "`nStep 3/5: Memverifikasi package kritis..." -ForegroundColor Yellow
    $missing = @()
    
    if (-not (Test-Path "node_modules/autoprefixer")) { $missing += "autoprefixer" }
    if (-not (Test-Path "node_modules/postcss")) { $missing += "postcss" }
    if (-not (Test-Path "node_modules/tailwindcss")) { $missing += "tailwindcss" }
    
    if ($missing.Count -gt 0) {
        Write-Host "   Package yang hilang: $($missing -join ', ')" -ForegroundColor Yellow
        Write-Host "   Menginstall package yang hilang..." -ForegroundColor Gray
        npm install $missing --save-dev --legacy-peer-deps
        Write-Host "   ✓ Package terinstall" -ForegroundColor Green
    } else {
        Write-Host "   ✓ Semua package ada" -ForegroundColor Green
    }
    
    # Clean npm cache
    Write-Host "`nStep 4/5: Membersihkan npm cache..." -ForegroundColor Yellow
    npm cache clean --force
    Write-Host "✓ Cache dibersihkan" -ForegroundColor Green
}

# Start server
Write-Host "`nStep Final: Memulai dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Server akan berjalan di:                  ║" -ForegroundColor Green
Write-Host "║  http://localhost:3002                     ║" -ForegroundColor Green
Write-Host "║                                            ║" -ForegroundColor Green
Write-Host "║  Tekan Ctrl+C untuk menghentikan           ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

npm run dev
