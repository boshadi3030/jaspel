#!/usr/bin/env pwsh
# Script untuk memperbaiki error Invalid Refresh Token

Write-Host "=== Perbaikan Error Invalid Refresh Token ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Informasi
Write-Host "Error ini terjadi karena refresh token yang invalid/expired di browser" -ForegroundColor Yellow
Write-Host "Solusi yang sudah diterapkan:" -ForegroundColor Green
Write-Host "1. Update Supabase client dengan konfigurasi PKCE flow" -ForegroundColor White
Write-Host "2. Tambah error handler untuk membersihkan token invalid" -ForegroundColor White
Write-Host "3. Update middleware untuk clear cookies saat error" -ForegroundColor White
Write-Host ""

# Step 2: Instruksi untuk user
Write-Host "Langkah yang perlu Anda lakukan:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Buka browser Anda (Chrome/Edge/Firefox)" -ForegroundColor Yellow
Write-Host "2. Tekan F12 untuk membuka Developer Tools" -ForegroundColor Yellow
Write-Host "3. Buka tab 'Application' atau 'Storage'" -ForegroundColor Yellow
Write-Host "4. Klik 'Local Storage' dan hapus semua item yang mengandung 'supabase'" -ForegroundColor Yellow
Write-Host "5. Klik 'Cookies' dan hapus semua cookies dari localhost:3002" -ForegroundColor Yellow
Write-Host "6. Tutup Developer Tools dan refresh halaman (Ctrl+Shift+R)" -ForegroundColor Yellow
Write-Host ""

Write-Host "Atau cara cepat:" -ForegroundColor Cyan
Write-Host "- Buka browser dalam mode Incognito/Private" -ForegroundColor Yellow
Write-Host "- Akses http://localhost:3002" -ForegroundColor Yellow
Write-Host ""

# Step 3: Restart dev server
Write-Host "Apakah Anda ingin restart dev server? (Y/N)" -ForegroundColor Green
$restart = Read-Host

if ($restart -eq "Y" -or $restart -eq "y") {
    Write-Host ""
    Write-Host "Menghentikan server yang sedang berjalan..." -ForegroundColor Yellow
    
    # Kill existing node processes
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    
    Start-Sleep -Seconds 2
    
    Write-Host "Memulai dev server..." -ForegroundColor Green
    Write-Host ""
    
    # Start dev server
    npm run dev
} else {
    Write-Host ""
    Write-Host "Silakan restart dev server secara manual dengan:" -ForegroundColor Yellow
    Write-Host "npm run dev" -ForegroundColor White
    Write-Host ""
}

Write-Host "Setelah browser cache dibersihkan, error seharusnya tidak muncul lagi." -ForegroundColor Green
Write-Host "Sistem sekarang akan otomatis menangani token invalid dan redirect ke login." -ForegroundColor Green
