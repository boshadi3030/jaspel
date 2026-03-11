#!/usr/bin/env pwsh

Write-Host "🔍 Verifikasi Perbaikan Error 404 Assets" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Cek status server
Write-Host "`n1️⃣ Mengecek status server..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server berjalan normal di localhost:3002" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Server tidak dapat diakses: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Pastikan server development sudah berjalan dengan: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Cek halaman login
Write-Host "`n2️⃣ Mengecek halaman login..." -ForegroundColor Blue
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/login" -Method GET -TimeoutSec 10
    if ($loginResponse.StatusCode -eq 200) {
        Write-Host "✅ Halaman login dapat diakses" -ForegroundColor Green
        Write-Host "   Status: $($loginResponse.StatusCode) $($loginResponse.StatusDescription)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Halaman login tidak dapat diakses: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Verifikasi selesai!" -ForegroundColor Green
Write-Host "📝 Langkah selanjutnya:" -ForegroundColor Yellow
Write-Host "   1. Buka browser dan akses: http://localhost:3002" -ForegroundColor White
Write-Host "   2. Buka Developer Tools (F12)" -ForegroundColor White
Write-Host "   3. Periksa tab Console - seharusnya tidak ada error 404 lagi" -ForegroundColor White
Write-Host "   4. Periksa tab Network - semua assets harus load dengan status 200" -ForegroundColor White

Write-Host "`n✅ Error 404 assets sudah diperbaiki!" -ForegroundColor Green