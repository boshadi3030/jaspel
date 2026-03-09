Write-Host "🚀 Starting JASPEL System - Login Fix Test" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Kill any existing Next.js processes
Write-Host "🔄 Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node_modules*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clear Next.js cache
Write-Host "🧹 Clearing cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

# Start development server
Write-Host ""
Write-Host "🌐 Starting development server..." -ForegroundColor Green
Write-Host "   URL: http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "📝 Test Credentials:" -ForegroundColor Cyan
Write-Host "   Email: mukhsin9@gmail.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "✅ What to check:" -ForegroundColor Yellow
Write-Host "   1. No console errors" -ForegroundColor White
Write-Host "   2. Login button works" -ForegroundColor White
Write-Host "   3. Redirects to /admin/dashboard" -ForegroundColor White
Write-Host "   4. Dashboard loads successfully" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev
