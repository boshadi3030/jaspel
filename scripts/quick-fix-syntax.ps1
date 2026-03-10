# Quick Fix for Syntax Error
Write-Host "🔧 Quick fix for syntax error..." -ForegroundColor Cyan

# Clear cache
Write-Host "Clearing cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Start server
Write-Host "Starting server..." -ForegroundColor Green
npm run dev
