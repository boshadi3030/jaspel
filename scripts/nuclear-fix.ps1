# Nuclear Fix - Complete Clean Rebuild
Write-Host "💣 Nuclear Fix - Complete Clean Rebuild" -ForegroundColor Red
Write-Host "This will completely clean and rebuild everything`n" -ForegroundColor Yellow

# 1. Kill all node processes
Write-Host "1. Killing all Node.js processes..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Delete ALL cache and build artifacts
Write-Host "2. Deleting all cache and build artifacts..." -ForegroundColor Cyan
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .cache -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\next-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:LOCALAPPDATA\npm-cache -ErrorAction SilentlyContinue

# 3. Clear npm cache aggressively
Write-Host "3. Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force
npm cache verify

# 4. Fresh install
Write-Host "4. Fresh npm install..." -ForegroundColor Cyan
npm install --no-cache --prefer-offline=false

# 5. Verify installation
Write-Host "5. Verifying installation..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    exit 1
}

# 6. Start dev server
Write-Host "`n6. Starting dev server..." -ForegroundColor Cyan
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "`nServer starting at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray

$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
