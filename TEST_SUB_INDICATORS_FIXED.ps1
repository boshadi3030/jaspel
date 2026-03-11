#!/usr/bin/env pwsh

Write-Host "🎯 TESTING SUB INDICATORS FIX" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 PERBAIKAN YANG DILAKUKAN:" -ForegroundColor Yellow
Write-Host "1. ✅ RLS policies diperbaiki untuk tabel m_kpi_sub_indicators" -ForegroundColor Green
Write-Host "2. ✅ Superadmin access ditambahkan ke sub indicators" -ForegroundColor Green
Write-Host "3. ✅ KPITree component state management diperbaiki" -ForegroundColor Green
Write-Host "4. ✅ Auto-expand indicators yang memiliki sub indicators" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 VERIFYING DATABASE ACCESS..." -ForegroundColor Yellow
npx tsx scripts/verify-sub-indicators-complete.ts

Write-Host ""
Write-Host "🌐 STARTING DEVELOPMENT SERVER..." -ForegroundColor Yellow
Write-Host "Server akan berjalan di: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Halaman KPI Config: http://localhost:3000/kpi-config" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 MANUAL TESTING CHECKLIST:" -ForegroundColor Yellow
Write-Host "1. Buka http://localhost:3000/kpi-config" -ForegroundColor White
Write-Host "2. Login sebagai superadmin jika diperlukan" -ForegroundColor White
Write-Host "3. Pilih unit 'UK01 - MEDIS'" -ForegroundColor White
Write-Host "4. Expand kategori P1" -ForegroundColor White
Write-Host "5. Periksa indikator:" -ForegroundColor White
Write-Host "   - IND-001: Profesional Grade (harus ada 3 sub indikator)" -ForegroundColor Gray
Write-Host "   - IND-002: Beban Resiko Kerja (harus ada 2 sub indikator)" -ForegroundColor Gray
Write-Host "   - IND-003: Indikator Kinerja Unit (harus ada 0 sub indikator)" -ForegroundColor Gray
Write-Host "6. Klik tombol expand pada IND-001 dan IND-002" -ForegroundColor White
Write-Host "7. Verifikasi sub indikator terlihat dengan score badges" -ForegroundColor White
Write-Host "8. Periksa tombol 'Tambah Sub Indikator' tersedia" -ForegroundColor White
Write-Host ""

Write-Host "✅ HASIL YANG DIHARAPKAN:" -ForegroundColor Green
Write-Host "- Sub indikator tampil ketika indikator di-expand" -ForegroundColor White
Write-Host "- Tombol 'Tambah Sub Indikator' terlihat di setiap indikator" -ForegroundColor White
Write-Host "- Score badges (1-5) tampil untuk setiap sub indikator" -ForegroundColor White
Write-Host "- Tidak ada error di browser console" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "🚀 Starting server..." -ForegroundColor Green
npm run dev