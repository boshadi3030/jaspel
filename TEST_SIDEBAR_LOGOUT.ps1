# Test Sidebar dan Logout
Write-Host "=== Testing Sidebar dan Logout ===" -ForegroundColor Cyan
Write-Host ""

# Start dev server in background
Write-Host "Starting development server..." -ForegroundColor Yellow
$devServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -PassThru -WindowStyle Minimized

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

try {
    # Test login
    Write-Host "`nTesting login..." -ForegroundColor Yellow
    
    Write-Host "`n1. Buka browser ke: http://localhost:3002/login" -ForegroundColor Green
    Write-Host "2. Login dengan:" -ForegroundColor Green
    Write-Host "   Email: admin@jaspel.com" -ForegroundColor White
    Write-Host "   Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Setelah login, periksa:" -ForegroundColor Green
    Write-Host "   - Apakah menu sidebar terlihat dengan jelas?" -ForegroundColor White
    Write-Host "   - Apakah semua item menu (Dashboard, Users, Units, dll) tampil?" -ForegroundColor White
    Write-Host "   - Apakah tidak ada overlap antara sidebar dan konten?" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Test logout:" -ForegroundColor Green
    Write-Host "   - Klik tombol 'Keluar' di bagian bawah sidebar" -ForegroundColor White
    Write-Host "   - Konfirmasi logout" -ForegroundColor White
    Write-Host "   - Pastikan redirect ke halaman login" -ForegroundColor White
    Write-Host ""
    
    # Open browser
    Start-Process "http://localhost:3002/login"
    
    Write-Host "`nTekan Enter setelah selesai testing..." -ForegroundColor Cyan
    Read-Host
    
} finally {
    # Stop dev server
    Write-Host "`nStopping development server..." -ForegroundColor Yellow
    Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Done!" -ForegroundColor Green
}
