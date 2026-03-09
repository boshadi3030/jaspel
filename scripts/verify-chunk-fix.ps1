Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFIKASI PERBAIKAN CHUNK LOAD ERROR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Memeriksa server..." -ForegroundColor Yellow
$response = $null
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
} catch {
    Write-Host "❌ Server tidak berjalan di http://localhost:3000" -ForegroundColor Red
    Write-Host ""
    Write-Host "Jalankan server terlebih dahulu dengan:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ Server berjalan" -ForegroundColor Green
Write-Host ""

# Install playwright if needed
Write-Host "Memeriksa Playwright..." -ForegroundColor Yellow
$playwrightInstalled = npm list playwright 2>$null
if (-not $playwrightInstalled) {
    Write-Host "Installing Playwright..." -ForegroundColor Yellow
    npm install -D playwright
    npx playwright install chromium
}

Write-Host "✓ Playwright siap" -ForegroundColor Green
Write-Host ""

# Run test
Write-Host "Menjalankan test..." -ForegroundColor Yellow
Write-Host ""

npx tsx scripts/test-chunk-fix.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  PERBAIKAN BERHASIL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Perubahan yang dilakukan:" -ForegroundColor Cyan
    Write-Host "  1. Menghapus ChunkLoadErrorBoundary dari root layout" -ForegroundColor White
    Write-Host "  2. Memindahkan error boundary ke SidebarLayout" -ForegroundColor White
    Write-Host "  3. Menggunakan Suspense di root layout" -ForegroundColor White
    Write-Host "  4. Membersihkan cache .next dan rebuild" -ForegroundColor White
    Write-Host ""
    Write-Host "Aplikasi sekarang dapat diakses di:" -ForegroundColor Cyan
    Write-Host "  http://localhost:3000" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  MASIH ADA MASALAH" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Silakan periksa error di atas" -ForegroundColor Yellow
    Write-Host ""
}
