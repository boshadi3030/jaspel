#!/usr/bin/env pwsh

Write-Host "Quick Fix Pool Error" -ForegroundColor Cyan
Write-Host ""

# Clean all caches
Write-Host "1. Cleaning caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Write-Host "   ✓ Done" -ForegroundColor Green

Write-Host ""
Write-Host "2. Starting dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Server: http://localhost:3002/pool" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm run dev
