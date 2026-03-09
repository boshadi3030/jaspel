# Quick fix untuk error 500 - Restart cepat tanpa build
Write-Host "=== QUICK FIX ERROR 500 ===" -ForegroundColor Cyan

# Stop Node.js
Write-Host "Menghentikan Node.js..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Hapus .next
Write-Host "Menghapus cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}

Write-Host ""
Write-Host "PENTING: Bersihkan cache browser!" -ForegroundColor Red
Write-Host "- Gunakan mode Incognito/Private" -ForegroundColor White
Write-Host "- Atau tekan Ctrl+Shift+R untuk hard refresh" -ForegroundColor White
Write-Host ""
Write-Host "Menjalankan aplikasi..." -ForegroundColor Green
Write-Host "Akses: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

npm run dev
