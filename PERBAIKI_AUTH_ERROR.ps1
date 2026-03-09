#!/usr/bin/env pwsh

Write-Host "🔧 Memperbaiki Error Refresh Token..." -ForegroundColor Cyan
Write-Host ""

# Stop any running dev server
Write-Host "⏹️  Menghentikan server yang berjalan..." -ForegroundColor Yellow
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "✅ Server dihentikan" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Tidak ada server yang berjalan" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 Langkah-langkah perbaikan:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Buka browser Anda (Chrome/Edge/Firefox)" -ForegroundColor White
Write-Host "2. Tekan F12 untuk membuka DevTools" -ForegroundColor White
Write-Host "3. Pergi ke tab Console" -ForegroundColor White
Write-Host "4. Jalankan perintah berikut:" -ForegroundColor White
Write-Host ""
Write-Host "   localStorage.clear()" -ForegroundColor Yellow
Write-Host "   sessionStorage.clear()" -ForegroundColor Yellow
Write-Host "   location.reload()" -ForegroundColor Yellow
Write-Host ""
Write-Host "ATAU" -ForegroundColor Cyan
Write-Host ""
Write-Host "Hapus cookies untuk localhost:3002 dari browser settings" -ForegroundColor White
Write-Host ""

# Start dev server
Write-Host "🚀 Memulai server development..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Server akan berjalan di: http://localhost:3002" -ForegroundColor Green
Write-Host ""
Write-Host "Setelah server berjalan:" -ForegroundColor Yellow
Write-Host "1. Buka http://localhost:3002" -ForegroundColor White
Write-Host "2. Bersihkan cache browser (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "3. Login dengan: mukhsin9@gmail.com / admin123" -ForegroundColor White
Write-Host ""

npm run dev
