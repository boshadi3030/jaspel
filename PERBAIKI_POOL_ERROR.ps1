#!/usr/bin/env pwsh

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Fix Pool Page Chunk Error" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Cleaning .next directory..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✓ Cleaned" -ForegroundColor Green
} else {
    Write-Host "   ✓ Already clean" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Cleaning node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "   ✓ Cache cleaned" -ForegroundColor Green
} else {
    Write-Host "   ✓ No cache to clean" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Rebuilding application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Yellow
    npm run dev
} else {
    Write-Host ""
    Write-Host "✗ Build failed!" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
}
