# Fix Syntax Error in main-app.js
Write-Host "🔧 Fixing syntax error in bundled JavaScript..." -ForegroundColor Cyan

# 1. Stop any running dev server
Write-Host "`n1. Stopping any running dev server..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Clear all caches
Write-Host "`n2. Clearing all caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .cache -ErrorAction SilentlyContinue

# 3. Clear npm cache
Write-Host "`n3. Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# 4. Reinstall dependencies (clean install)
Write-Host "`n4. Reinstalling dependencies..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install

# 5. Start dev server with clean state
Write-Host "`n5. Starting dev server with clean state..." -ForegroundColor Yellow
Write-Host "✅ Setup complete! Starting server..." -ForegroundColor Green
Write-Host "`nServer will start at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray

npm run dev
