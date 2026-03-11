#!/usr/bin/env pwsh

Write-Host "🔧 JASPEL - Quick Chunk Error Fix" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Stop any running processes
Write-Host "🛑 Stopping running processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean build artifacts
Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "node_modules/.cache") { Remove-Item -Recurse -Force "node_modules/.cache" }

# Reinstall dependencies
Write-Host "📦 Reinstalling dependencies..." -ForegroundColor Yellow
npm ci

# Build application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    # Start development server
    Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev"
    
    Start-Sleep -Seconds 3
    
    Write-Host "🌐 Opening pool page..." -ForegroundColor Yellow
    Start-Process "http://localhost:3000/pool"
    
    Write-Host "✅ Chunk error fix completed!" -ForegroundColor Green
    Write-Host "📝 Check browser console - chunk errors should be resolved" -ForegroundColor Yellow
} else {
    Write-Host "❌ Build failed! Check error messages above." -ForegroundColor Red
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")