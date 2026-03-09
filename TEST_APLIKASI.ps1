# Script Test Aplikasi JASPEL
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST APLIKASI JASPEL KPI SYSTEM      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verifikasi Build Files
Write-Host "Step 1: Verifikasi Build Files..." -ForegroundColor Yellow
$criticalFiles = @(
    ".next\server\app\login\page.js",
    ".next\server\app\page.js",
    ".next\server\app\admin\dashboard\page.js",
    ".next\server\app\manager\dashboard\page.js",
    ".next\server\app\employee\dashboard\page.js"
)

$allOk = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file TIDAK DITEMUKAN!" -ForegroundColor Red
        $allOk = $false
    }
}

if (-not $allOk) {
    Write-Host ""
    Write-Host "Build files tidak lengkap. Jalankan: npm run build" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Verifikasi Environment Variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "  ✓ .env.local ditemukan" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "  ✓ NEXT_PUBLIC_SUPABASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "  ✗ NEXT_PUBLIC_SUPABASE_URL tidak ditemukan!" -ForegroundColor Red
        $allOk = $false
    }
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
        Write-Host "  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "  ✗ NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan!" -ForegroundColor Red
        $allOk = $false
    }
} else {
    Write-Host "  ✗ .env.local tidak ditemukan!" -ForegroundColor Red
    Write-Host "  Copy .env.local.example ke .env.local dan isi dengan credentials Supabase" -ForegroundColor Yellow
    $allOk = $false
}

Write-Host ""
if ($allOk) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ SEMUA VERIFIKASI BERHASIL!         " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Aplikasi siap dijalankan!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Untuk memulai development server:" -ForegroundColor Yellow
    Write-Host "  .\START_DEV_SERVER.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Atau langsung:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Server akan berjalan di: http://localhost:3002" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Kredensial testing:" -ForegroundColor Yellow
    Write-Host "  Email: mukhsin9@gmail.com" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ ADA MASALAH YANG PERLU DIPERBAIKI  " -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Perbaiki masalah di atas sebelum menjalankan aplikasi." -ForegroundColor Yellow
    exit 1
}
