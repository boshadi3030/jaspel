# Script untuk memverifikasi perbaikan security authentication

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Verifikasi Security Authentication" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Pastikan tidak ada getSession() di kode aplikasi
Write-Host "1. Memeriksa penggunaan getSession() di kode aplikasi..." -ForegroundColor Yellow
$appPaths = @("app", "lib", "components", "services", "middleware.ts")
$getSessionFiles = @()

foreach ($path in $appPaths) {
    if (Test-Path $path) {
        $results = Get-ChildItem -Path $path -Include *.ts,*.tsx -Recurse -File -ErrorAction SilentlyContinue | Select-String -Pattern "getSession\(\)"
        if ($results) {
            $getSessionFiles += $results
        }
    }
}

if ($getSessionFiles.Count -eq 0) {
    Write-Host "   ✅ Tidak ada penggunaan getSession() yang tidak aman" -ForegroundColor Green
} else {
    Write-Host "   ❌ Ditemukan $($getSessionFiles.Count) penggunaan getSession()" -ForegroundColor Red
    $getSessionFiles | ForEach-Object { Write-Host "      $_" -ForegroundColor Red }
}

Write-Host ""

# Check 2: Verifikasi penggunaan getUser() di kode aplikasi
Write-Host "2. Memeriksa penggunaan getUser() di kode aplikasi..." -ForegroundColor Yellow
$getUserFiles = @()

foreach ($path in $appPaths) {
    if (Test-Path $path) {
        $results = Get-ChildItem -Path $path -Include *.ts,*.tsx -Recurse -File -ErrorAction SilentlyContinue | Select-String -Pattern "getUser\(\)"
        if ($results) {
            $getUserFiles += $results
        }
    }
}

if ($getUserFiles.Count -gt 0) {
    Write-Host "   ✅ Ditemukan $($getUserFiles.Count) penggunaan getUser() yang aman" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Tidak ditemukan penggunaan getUser()" -ForegroundColor Yellow
}

Write-Host ""

# Check 3: Verifikasi file kritis
Write-Host "3. Memeriksa file kritis..." -ForegroundColor Yellow

$criticalFiles = @(
    "middleware.ts",
    "lib/services/auth.service.ts",
    "lib/hooks/useAuth.ts"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        $hasGetUser = Select-String -Path $file -Pattern "getUser\(\)" -Quiet
        $hasGetSession = Select-String -Path $file -Pattern "getSession\(\)" -Quiet
        
        if ($hasGetUser -and -not $hasGetSession) {
            Write-Host "   ✅ $file - Menggunakan getUser()" -ForegroundColor Green
        } elseif ($hasGetSession) {
            Write-Host "   ❌ $file - Masih menggunakan getSession()" -ForegroundColor Red
        } else {
            Write-Host "   ⚠️  $file - Tidak menggunakan auth" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ $file - File tidak ditemukan" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Verifikasi Selesai" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
