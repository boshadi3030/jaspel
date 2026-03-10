#!/usr/bin/env pwsh

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Fix Pool Guide Feature" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Force tsconfig.tsbuildinfo -ErrorAction SilentlyContinue

Write-Host "✓ Cleaned" -ForegroundColor Green
Write-Host ""

Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "Server will run on http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test the feature:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3002/pool" -ForegroundColor White
Write-Host "2. Click 'Unduh Petunjuk' button (amber color)" -ForegroundColor White
Write-Host "3. PDF should download automatically" -ForegroundColor White
Write-Host ""

npm run dev
