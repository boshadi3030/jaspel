#!/usr/bin/env pwsh

Write-Host "🧹 Membersihkan cache dan restart development server..." -ForegroundColor Cyan

# Stop any running Next.js processes
Write-Host "`n📛 Menghentikan proses Next.js yang berjalan..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node_modules*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean build artifacts
Write-Host "`n🗑️  Menghapus build artifacts..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   ✓ .next dihapus" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "   ✓ node_modules\.cache dihapus" -ForegroundColor Green
}

# Clear npm cache (optional, uncomment if needed)
# Write-Host "`n🧼 Membersihkan npm cache..." -ForegroundColor Yellow
# npm cache clean --force

Write-Host "`n✅ Cache berhasil dibersihkan!" -ForegroundColor Green
Write-Host "`n🚀 Memulai development server..." -ForegroundColor Cyan
Write-Host "   Server akan berjalan di: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Tekan Ctrl+C untuk menghentikan server`n" -ForegroundColor Gray

# Start development server
npm run dev
