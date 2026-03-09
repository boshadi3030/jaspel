Write-Host "🔧 Memperbaiki Error Login 404" -ForegroundColor Cyan
Write-Host ""

# Stop dev server jika masih running
Write-Host "1️⃣ Menghentikan dev server..." -ForegroundColor Yellow
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($processes) {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Dev server dihentikan" -ForegroundColor Green
} else {
    Write-Host "✅ Tidak ada dev server yang berjalan" -ForegroundColor Green
}
Write-Host ""

# Clear Next.js cache
Write-Host "2️⃣ Membersihkan cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "✅ Cache .next dihapus" -ForegroundColor Green
} else {
    Write-Host "✅ Tidak ada cache .next" -ForegroundColor Green
}
Write-Host ""

# Verify database
Write-Host "3️⃣ Memverifikasi database..." -ForegroundColor Yellow
npx tsx scripts/fix-login-404.ts
Write-Host ""

# Start dev server
Write-Host "4️⃣ Memulai dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Langkah selanjutnya:" -ForegroundColor Cyan
Write-Host "   1. Server akan dimulai otomatis" -ForegroundColor White
Write-Host "   2. Buka browser dalam mode INCOGNITO/PRIVATE" -ForegroundColor White
Write-Host "   3. Buka http://localhost:3000/login" -ForegroundColor White
Write-Host "   4. Login dengan: mukhsin9@gmail.com / admin123" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  PENTING: Gunakan mode INCOGNITO untuk menghindari cache browser!" -ForegroundColor Yellow
Write-Host ""

npm run dev
