#!/usr/bin/env pwsh

Write-Host "=== Testing Fix for Sidebar Error ===" -ForegroundColor Cyan
Write-Host ""

# Stop any running Node processes
Write-Host "1. Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clear Next.js cache
Write-Host "2. Clearing Next.js cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "=== Starting Development Server ===" -ForegroundColor Green
Write-Host ""
Write-Host "Server akan berjalan di: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Yellow
Write-Host ""

# Start dev server
npm run dev
