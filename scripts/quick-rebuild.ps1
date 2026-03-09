# Quick Rebuild - Hapus cache dan restart
Write-Host "=== Quick Rebuild ===" -ForegroundColor Cyan

# Stop running processes
Write-Host "Menghentikan proses..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Clean cache
Write-Host "Membersihkan cache..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Path ".next" -Recurse -Force }
if (Test-Path "node_modules/.cache") { Remove-Item -Path "node_modules/.cache" -Recurse -Force }

Write-Host "✓ Cache dibersihkan" -ForegroundColor Green
Write-Host ""
Write-Host "Memulai server..." -ForegroundColor Cyan
Write-Host "Server: http://localhost:3002" -ForegroundColor Green
Write-Host ""

npm run dev
