Write-Host "🧹 Membersihkan build cache..." -ForegroundColor Yellow

# Stop any running dev server
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next dev*" }
if ($processes) {
    Write-Host "⏹️  Menghentikan dev server..." -ForegroundColor Yellow
    $processes | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Clean .next folder
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Folder .next dibersihkan" -ForegroundColor Green
}

# Start dev server
Write-Host "`n🚀 Memulai dev server..." -ForegroundColor Cyan
npm run dev
