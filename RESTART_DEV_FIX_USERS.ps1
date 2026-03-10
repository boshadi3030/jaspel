Write-Host "🔄 Restarting Dev Server - Fix Users Route Error" -ForegroundColor Cyan
Write-Host "=" -NoNewline; Write-Host ("=" * 69)
Write-Host ""

# Kill existing Node processes on port 3002
Write-Host "1️⃣ Stopping existing dev server..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "   Killing process $pid..." -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Server stopped" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No server running on port 3002" -ForegroundColor Gray
}

# Clear Next.js cache
Write-Host ""
Write-Host "2️⃣ Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No cache to clear" -ForegroundColor Gray
}

# Start dev server
Write-Host ""
Write-Host "3️⃣ Starting dev server..." -ForegroundColor Yellow
Write-Host "   Server will start on http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "=" -NoNewline; Write-Host ("=" * 69)
Write-Host ""
Write-Host "✅ Fixed: Added /api/users route to handle incorrect API calls" -ForegroundColor Green
Write-Host "📝 The users page is at: http://localhost:3002/users" -ForegroundColor Cyan
Write-Host ""

# Start the server
npm run dev
