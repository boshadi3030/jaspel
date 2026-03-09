Write-Host "=== Memperbaiki Chunk Error ===" -ForegroundColor Cyan
Write-Host ""

# Stop semua proses Node.js yang berjalan
Write-Host "1. Menghentikan proses Node.js..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Hapus folder .next
Write-Host "2. Menghapus cache .next..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Cache .next dihapus" -ForegroundColor Green
}

# Hapus node_modules/.cache jika ada
Write-Host "3. Menghapus cache node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Cache node_modules dihapus" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Cache dibersihkan ===" -ForegroundColor Green
Write-Host ""
Write-Host "Sekarang jalankan server dengan:" -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Jika masih error, coba:" -ForegroundColor Yellow
Write-Host "1. Tutup semua tab browser yang membuka localhost:3002" -ForegroundColor White
Write-Host "2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "3. Buka browser dalam mode incognito" -ForegroundColor White
Write-Host "4. Akses http://localhost:3002/login" -ForegroundColor White
