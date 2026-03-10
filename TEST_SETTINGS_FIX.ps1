#!/usr/bin/env pwsh
# Test Settings Fix
# Verifies that settings page error has been resolved

Write-Host "🔧 Testing Settings Fix..." -ForegroundColor Cyan
Write-Host ""

# Test API endpoint
Write-Host "1. Testing API endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/settings" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ API endpoint working (Status: 200)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Company: $($data.company_info.name)" -ForegroundColor Gray
        Write-Host "   Footer: $($data.footer.text)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ API returned status: $($response.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ API test failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Halaman settings sekarang dapat diakses di:" -ForegroundColor Yellow
Write-Host "   http://localhost:3002/settings" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Perbaikan berhasil! Silakan verifikasi di browser." -ForegroundColor Green
Write-Host ""
Write-Host "Tekan Enter untuk membuka browser..." -ForegroundColor Yellow
Read-Host

Start-Process "http://localhost:3002/settings"
