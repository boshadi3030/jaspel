# Fix Build Error - Clean and Rebuild
Write-Host "=== Memperbaiki Build Error ===" -ForegroundColor Cyan

# Stop any running dev server
Write-Host "`n1. Menghentikan server yang berjalan..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node_modules*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean .next directory
Write-Host "`n2. Membersihkan cache build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "   ✓ Cache .next dihapus" -ForegroundColor Green
}

# Clean node_modules/.cache
Write-Host "`n3. Membersihkan cache node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force
    Write-Host "   ✓ Cache node_modules dihapus" -ForegroundColor Green
}

# Verify critical files exist
Write-Host "`n4. Memverifikasi file penting..." -ForegroundColor Yellow
$criticalFiles = @(
    "app/login/page.tsx",
    "app/layout.tsx",
    "app/page.tsx",
    "middleware.ts",
    "next.config.js"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file TIDAK DITEMUKAN!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "`n❌ Ada file penting yang hilang!" -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "`n5. Membangun aplikasi..." -ForegroundColor Yellow
Write-Host "   Ini mungkin memakan waktu beberapa menit..." -ForegroundColor Gray

$buildOutput = npm run build 2>&1
$buildSuccess = $LASTEXITCODE -eq 0

if ($buildSuccess) {
    Write-Host "   ✓ Build berhasil!" -ForegroundColor Green
} else {
    Write-Host "   ✗ Build gagal!" -ForegroundColor Red
    Write-Host "`nOutput error:" -ForegroundColor Yellow
    Write-Host $buildOutput
    exit 1
}

# Start dev server
Write-Host "`n6. Memulai development server..." -ForegroundColor Yellow
Write-Host "   Server akan berjalan di http://localhost:3002" -ForegroundColor Cyan
Write-Host "   Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Gray
Write-Host ""

npm run dev
