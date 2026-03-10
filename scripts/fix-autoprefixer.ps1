# Fix Autoprefixer Missing Module Error
Write-Host "Memperbaiki error autoprefixer..." -ForegroundColor Cyan

# Stop any running npm processes
Write-Host "`nMenghentikan proses npm yang berjalan..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clear Next.js cache
Write-Host "`nMembersihkan cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "Cache .next dihapus" -ForegroundColor Green
}

# Check if node_modules exists and has autoprefixer
$autoprefixerPath = "node_modules\autoprefixer"
if (Test-Path $autoprefixerPath) {
    Write-Host "`nAutoprefixer sudah terinstall" -ForegroundColor Green
    Write-Host "Mencoba restart dev server..." -ForegroundColor Cyan
    npm run dev
    exit 0
}

# If autoprefixer not found, reinstall dependencies
Write-Host "`nAutoprefixer tidak ditemukan. Menginstall ulang dependencies..." -ForegroundColor Yellow

# Install specific packages
Write-Host "`nMenginstall autoprefixer, postcss, dan tailwindcss..." -ForegroundColor Cyan
npm install -D autoprefixer@^10.4.17 postcss@^8.4.35 tailwindcss@^3.4.1

# Verify installation
if (Test-Path $autoprefixerPath) {
    Write-Host "`n✓ Autoprefixer berhasil diinstall!" -ForegroundColor Green
    
    # Clear cache again
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    }
    
    Write-Host "`nMemulai dev server..." -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host "`n✗ Gagal menginstall autoprefixer" -ForegroundColor Red
    Write-Host "Coba jalankan manual: npm install" -ForegroundColor Yellow
}
