# Emergency Fix untuk White Screen Issue
Write-Host "========================================" -ForegroundColor Red
Write-Host "EMERGENCY FIX - WHITE SCREEN" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Step 1: Kill ALL Node processes
Write-Host "[1/7] Menghentikan SEMUA proses Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "next-server" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "  ✓ Semua proses dihentikan" -ForegroundColor Green

# Step 2: Clear ALL caches
Write-Host "[2/7] Membersihkan SEMUA cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "  ✓ Cache .next dihapus" -ForegroundColor Green
}
if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cache node_modules dihapus" -ForegroundColor Green
}

# Step 3: Clear temp files
Write-Host "[3/7] Membersihkan file temporary..." -ForegroundColor Yellow
Remove-Item -Path "$env:TEMP\next-*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Temp files dihapus" -ForegroundColor Green

# Step 4: Verify environment
Write-Host "[4/7] Verifikasi environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL" -and $envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
        Write-Host "  ✓ Environment variables OK" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Environment variables TIDAK LENGKAP!" -ForegroundColor Red
        Write-Host "  Pastikan .env.local berisi:" -ForegroundColor Yellow
        Write-Host "    NEXT_PUBLIC_SUPABASE_URL=..." -ForegroundColor White
        Write-Host "    NEXT_PUBLIC_SUPABASE_ANON_KEY=..." -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "  ✗ File .env.local TIDAK DITEMUKAN!" -ForegroundColor Red
    exit 1
}

# Step 5: Clean build
Write-Host "[5/7] Clean build..." -ForegroundColor Yellow
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Build GAGAL!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Mencoba reinstall dependencies..." -ForegroundColor Yellow
    npm install
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Build masih GAGAL setelah reinstall!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  ✓ Build berhasil" -ForegroundColor Green

# Step 6: Clear browser cache instruction
Write-Host "[6/7] INSTRUKSI PENTING!" -ForegroundColor Red
Write-Host ""
Write-Host "  SETELAH APLIKASI BERJALAN, WAJIB:" -ForegroundColor Red
Write-Host "  1. Tekan Ctrl+Shift+Delete" -ForegroundColor Yellow
Write-Host "  2. Pilih 'Cached images and files'" -ForegroundColor Yellow
Write-Host "  3. Klik 'Clear data'" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ATAU gunakan mode Incognito (Ctrl+Shift+N)" -ForegroundColor Yellow
Write-Host ""
Read-Host "Tekan Enter untuk melanjutkan..."

# Step 7: Start application
Write-Host "[7/7] Memulai aplikasi..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "APLIKASI SIAP DIJALANKAN!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login:" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "JANGAN LUPA CLEAR CACHE BROWSER!" -ForegroundColor Red
Write-Host ""

# Start dev server
npm run dev
