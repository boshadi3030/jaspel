#!/usr/bin/env pwsh

Write-Host "Membersihkan cache dan restart aplikasi..." -ForegroundColor Cyan

# Stop semua proses Node.js
Write-Host "`n1. Menghentikan proses Node.js..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Hapus folder .next
Write-Host "2. Menghapus folder .next..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Folder .next dihapus" -ForegroundColor Green
}

# Hapus node_modules/.cache jika ada
Write-Host "3. Menghapus cache node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules/.cache) {
    Remove-Item -Path node_modules/.cache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Cache node_modules dihapus" -ForegroundColor Green
}

Write-Host "`nCache berhasil dibersihkan!" -ForegroundColor Green
Write-Host "`nSilakan jalankan: npm run dev" -ForegroundColor Cyan
