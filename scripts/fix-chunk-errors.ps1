# Fix Next.js chunk loading errors
Write-Host "Membersihkan cache Next.js..." -ForegroundColor Yellow

# Stop any running dev server
Write-Host "Menghentikan server yang berjalan..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean Next.js cache and build artifacts
Write-Host "Menghapus folder .next..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Menghapus folder node_modules/.cache..." -ForegroundColor Cyan
if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

# Clear browser cache instruction
Write-Host "`n=== PENTING ===" -ForegroundColor Red
Write-Host "Setelah server restart, lakukan di browser:" -ForegroundColor Yellow
Write-Host "1. Tekan Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "2. Atau tekan Ctrl+F5 untuk hard refresh" -ForegroundColor White
Write-Host "3. Atau buka Incognito/Private window" -ForegroundColor White

# Restart dev server
Write-Host "`nMemulai ulang development server..." -ForegroundColor Green
npm run dev
