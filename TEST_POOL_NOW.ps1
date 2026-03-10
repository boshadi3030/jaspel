#!/usr/bin/env pwsh

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Pool Page Access" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Membersihkan cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Cache dibersihkan" -ForegroundColor Green
}

Write-Host ""
Write-Host "Memulai development server..." -ForegroundColor Yellow
Write-Host "Server akan berjalan di: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Langkah testing:" -ForegroundColor Yellow
Write-Host "1. Login sebagai superadmin" -ForegroundColor White
Write-Host "2. Akses halaman Pool dari menu sidebar" -ForegroundColor White
Write-Host "3. Pastikan halaman dapat diakses tanpa error" -ForegroundColor White
Write-Host ""
Write-Host "Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Yellow
Write-Host ""

npm run dev
