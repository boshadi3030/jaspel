#!/usr/bin/env pwsh

Write-Host "🔄 Restarting JASPEL Application..." -ForegroundColor Cyan

# Stop existing Node.js processes
Write-Host "1. Stopping existing processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
} catch {
    Write-Host "   No existing processes found" -ForegroundColor Gray
}

# Clear cache if needed
Write-Host "2. Checking cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Write-Host "   Clearing .next cache..." -ForegroundColor Gray
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
}

# Start development server
Write-Host "3. Starting development server..." -ForegroundColor Yellow
Write-Host "   Server will be available at: http://localhost:3002" -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev