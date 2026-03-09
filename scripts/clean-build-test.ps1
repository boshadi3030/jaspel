# Clean Build and Test Script
Write-Host "=== JASPEL Clean Build & Test ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean build artifacts
Write-Host "Step 1: Membersihkan build artifacts..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Folder .next dihapus" -ForegroundColor Green
}
if (Test-Path "tsconfig.tsbuildinfo") {
    Remove-Item -Force tsconfig.tsbuildinfo
    Write-Host "✓ File tsconfig.tsbuildinfo dihapus" -ForegroundColor Green
}
Write-Host ""

# Step 2: Build application
Write-Host "Step 2: Building aplikasi..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build berhasil!" -ForegroundColor Green
} else {
    Write-Host "✗ Build gagal!" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}
Write-Host ""

# Step 3: Check critical files
Write-Host "Step 3: Memeriksa file penting..." -ForegroundColor Yellow
$criticalFiles = @(
    ".next/server/app/login/page.js",
    ".next/server/app/page.js",
    ".next/server/app/admin/dashboard/page.js"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file TIDAK DITEMUKAN!" -ForegroundColor Red
        $allFilesExist = $false
    }
}
Write-Host ""

if (-not $allFilesExist) {
    Write-Host "✗ Beberapa file penting tidak ditemukan!" -ForegroundColor Red
    exit 1
}

# Step 4: Start dev server
Write-Host "Step 4: Memulai development server..." -ForegroundColor Yellow
Write-Host "Server akan berjalan di http://localhost:3002" -ForegroundColor Cyan
Write-Host "Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Cyan
Write-Host ""

npm run dev
