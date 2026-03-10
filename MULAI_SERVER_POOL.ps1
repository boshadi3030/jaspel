#!/usr/bin/env pwsh

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Start Development Server" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cleaning cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Write-Host "✓ Cache cleaned" -ForegroundColor Green

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""

npm run dev
