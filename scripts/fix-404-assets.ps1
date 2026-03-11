#!/usr/bin/env pwsh

Write-Host "🔧 Memperbaiki error 404 assets..." -ForegroundColor Yellow

# Stop semua proses Node.js yang berjalan
Write-Host "⏹️ Menghentikan proses Node.js..." -ForegroundColor Blue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Hapus cache dan build files
Write-Host "🗑️ Membersihkan cache dan build files..." -ForegroundColor Blue
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue

# Rebuild aplikasi
Write-Host "🔨 Rebuilding aplikasi..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build berhasil! Memulai server..." -ForegroundColor Green
    
    # Start server
    Write-Host "🚀 Memulai development server..." -ForegroundColor Blue
    npm run dev
} else {
    Write-Host "❌ Build gagal! Periksa error di atas." -ForegroundColor Red
    exit 1
}