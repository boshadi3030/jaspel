#!/usr/bin/env pwsh

Write-Host "🔧 JASPEL - Test Sidebar Fix" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test sidebar fix
Write-Host "📋 Running sidebar fix test..." -ForegroundColor Yellow
npx tsx scripts/test-sidebar-fix.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Test completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host ""
    
    npm run dev
} else {
    Write-Host ""
    Write-Host "❌ Test failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
