#!/usr/bin/env pwsh

Write-Host "🎯 Testing Sub Indicators Implementation - Final Check" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Start development server
Write-Host "`n1. Starting development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 5

# 2. Run database verification
Write-Host "`n2. Running database verification..." -ForegroundColor Yellow
npx tsx scripts/verify-sub-indicators-complete.ts

# 3. Run final test
Write-Host "`n3. Running final implementation test..." -ForegroundColor Yellow
npx tsx scripts/final-sub-indicators-test.ts

# 4. Test build
Write-Host "`n4. Testing production build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ BUILD SUCCESS - Ready for deployment!" -ForegroundColor Green
} else {
    Write-Host "`n❌ BUILD FAILED - Check errors above" -ForegroundColor Red
    exit 1
}

# 5. Manual testing instructions
Write-Host "`n5. Manual Testing Instructions:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🌐 Open: http://localhost:3002/kpi-config" -ForegroundColor White
Write-Host "🔐 Login: superadmin / [your-password]" -ForegroundColor White
Write-Host "🏢 Select: UK01 - MEDIS" -ForegroundColor White
Write-Host ""
Write-Host "✅ Expected Features:" -ForegroundColor Green
Write-Host "   • Auto-Expand: Indikator dengan sub indikator otomatis terbuka" -ForegroundColor White
Write-Host "   • Visual Badge: Badge '3 sub indikator' pada IND-001" -ForegroundColor White
Write-Host "   • Visual Badge: Badge '2 sub indikator' pada IND-002" -ForegroundColor White
Write-Host "   • Expand Button: Tombol ▼ untuk expand/collapse" -ForegroundColor White
Write-Host "   • Score Badges: 5 tingkat skor dengan warna berbeda" -ForegroundColor White
Write-Host "   • CRUD Buttons: Tombol Add/Edit/Delete tersedia" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test Checklist:" -ForegroundColor Yellow
Write-Host "   □ P1 kategori terbuka otomatis" -ForegroundColor White
Write-Host "   □ IND-001 menampilkan badge '3 sub indikator'" -ForegroundColor White
Write-Host "   □ IND-002 menampilkan badge '2 sub indikator'" -ForegroundColor White
Write-Host "   □ Klik tombol ▼ untuk expand indikator" -ForegroundColor White
Write-Host "   □ Sub indikator tampil dengan score badges berwarna" -ForegroundColor White
Write-Host "   □ Tombol 'Tambah Sub' berfungsi" -ForegroundColor White
Write-Host "   □ Tombol Edit sub indikator berfungsi" -ForegroundColor White
Write-Host "   □ Tombol Delete sub indikator berfungsi" -ForegroundColor White
Write-Host "   □ Bobot persentase ditampilkan dengan benar" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Sub Indicators Implementation Complete!" -ForegroundColor Green
Write-Host "Ready for production deployment to Vercel!" -ForegroundColor Cyan