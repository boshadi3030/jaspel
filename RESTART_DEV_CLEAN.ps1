# Restart Development Server (Clean)
Write-Host "🔄 Restarting Development Server..." -ForegroundColor Cyan

# Stop any running Next.js processes
Write-Host "`n1. Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node_modules*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear Next.js cache
Write-Host "`n2. Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "   ✅ .next directory removed" -ForegroundColor Green
}

# Start dev server
Write-Host "`n3. Starting development server..." -ForegroundColor Yellow
Write-Host "   Server will run on http://localhost:3002" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm run dev
