# Script untuk memperbaiki masalah sidebar yang tidak tampil

Write-Host "🔧 Memperbaiki Sidebar..." -ForegroundColor Cyan
Write-Host ""

# 1. Clear Next.js cache
Write-Host "1. Membersihkan cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   ✅ Cache dibersihkan" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Tidak ada cache" -ForegroundColor Gray
}

# 2. Rebuild aplikasi
Write-Host ""
Write-Host "2. Rebuild aplikasi..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Build berhasil" -ForegroundColor Green
} else {
    Write-Host "   ❌ Build gagal" -ForegroundColor Red
    exit 1
}

# 3. Start dev server
Write-Host ""
Write-Host "3. Memulai development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Langkah selanjutnya:" -ForegroundColor Cyan
Write-Host "   1. Buka browser ke http://localhost:3002/admin/dashboard" -ForegroundColor White
Write-Host "   2. Login dengan:" -ForegroundColor White
Write-Host "      - Email: admin@example.com atau mukhsin9@gmail.com" -ForegroundColor White
Write-Host "      - Password: password123" -ForegroundColor White
Write-Host "   3. Periksa apakah sidebar muncul di sebelah kiri" -ForegroundColor White
Write-Host "   4. Buka Console (F12) untuk melihat error jika ada" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Starting server..." -ForegroundColor Green
Write-Host ""

npm run dev
