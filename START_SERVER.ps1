# Start JASPEL Development Server
Write-Host "=== JASPEL KPI System ===" -ForegroundColor Cyan
Write-Host ""

# Stop existing processes
Write-Host "Menghentikan proses yang berjalan..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clean cache if needed
$cleanCache = Read-Host "Bersihkan cache? (y/n, default: n)"
if ($cleanCache -eq "y") {
    Write-Host "Membersihkan cache..." -ForegroundColor Yellow
    if (Test-Path ".next") { Remove-Item -Path ".next" -Recurse -Force }
    if (Test-Path "node_modules/.cache") { Remove-Item -Path "node_modules/.cache" -Recurse -Force }
    Write-Host "✓ Cache dibersihkan" -ForegroundColor Green
}

Write-Host ""
Write-Host "Memulai server..." -ForegroundColor Cyan
Write-Host "Server akan berjalan di:" -ForegroundColor White
Write-Host "  http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor White
Write-Host "  Email: mukhsin9@gmail.com" -ForegroundColor Cyan
Write-Host "  Password: admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Gray
Write-Host ""

npm run dev
