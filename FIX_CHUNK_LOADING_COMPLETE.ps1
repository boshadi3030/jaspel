#!/usr/bin/env pwsh

Write-Host "🔧 Memperbaiki masalah chunk loading secara menyeluruh..." -ForegroundColor Yellow

# Stop semua proses Node.js
Write-Host "⏹️  Menghentikan semua proses Node.js..." -ForegroundColor Blue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Hapus cache dan build files
Write-Host "🗑️  Membersihkan cache dan build files..." -ForegroundColor Blue
$pathsToClean = @(".next", "node_modules\.cache", ".vercel", "tsconfig.tsbuildinfo")

foreach ($path in $pathsToClean) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Dihapus: $path" -ForegroundColor Green
    }
}

# Clear npm cache
Write-Host "🧹 Membersihkan npm cache..." -ForegroundColor Blue
npm cache clean --force

# Reinstall dependencies
Write-Host "📦 Menginstall ulang dependencies..." -ForegroundColor Blue
npm install

# Build aplikasi
Write-Host "🏗️  Building aplikasi dengan konfigurasi baru..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Perbaikan chunk loading berhasil!" -ForegroundColor Green
    Write-Host "🚀 Menjalankan aplikasi..." -ForegroundColor Yellow
    
    # Start aplikasi
    npm run dev
} else {
    Write-Host "❌ Build gagal. Periksa error di atas." -ForegroundColor Red
    exit 1
}