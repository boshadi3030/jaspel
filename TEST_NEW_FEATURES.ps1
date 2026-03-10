#!/usr/bin/env pwsh

Write-Host "🚀 Testing New Features - Units & Pegawai Management" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Test database migration
Write-Host "1️⃣ Testing database migration..." -ForegroundColor Yellow
npx tsx scripts/test-new-features.ts

Write-Host ""
Write-Host "✅ Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Features Added:" -ForegroundColor Cyan
Write-Host "   ✓ Tombol Unduh Template (warna hijau emerald)" -ForegroundColor White
Write-Host "   ✓ Tombol Import Data (warna kuning amber)" -ForegroundColor White
Write-Host "   ✓ Tombol Unduh Excel (warna biru)" -ForegroundColor White
Write-Host "   ✓ Tombol Unduh PDF (warna merah rose)" -ForegroundColor White
Write-Host "   ✓ Field NIK di form pegawai" -ForegroundColor White
Write-Host "   ✓ Field Nomor Rekening Bank di form pegawai" -ForegroundColor White
Write-Host "   ✓ Field Nama Bank di form pegawai" -ForegroundColor White
Write-Host "   ✓ Field Nama Pemegang Rekening di form pegawai" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Manual Testing Steps:" -ForegroundColor Cyan
Write-Host "   1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "   2. Login sebagai superadmin" -ForegroundColor White
Write-Host "   3. Buka /admin/units" -ForegroundColor White
Write-Host "      - Test tombol Unduh Template" -ForegroundColor Gray
Write-Host "      - Test tombol Import Data (upload Excel)" -ForegroundColor Gray
Write-Host "      - Test tombol Unduh Excel" -ForegroundColor Gray
Write-Host "      - Test tombol Unduh PDF" -ForegroundColor Gray
Write-Host "   4. Buka /admin/pegawai" -ForegroundColor White
Write-Host "      - Test tombol Unduh Template" -ForegroundColor Gray
Write-Host "      - Test tombol Import Data (upload Excel)" -ForegroundColor Gray
Write-Host "      - Test tombol Unduh Excel" -ForegroundColor Gray
Write-Host "      - Test tombol Unduh PDF" -ForegroundColor Gray
Write-Host "      - Klik Tambah Pegawai dan verifikasi field baru:" -ForegroundColor Gray
Write-Host "        * NIK" -ForegroundColor DarkGray
Write-Host "        * Jabatan" -ForegroundColor DarkGray
Write-Host "        * Telepon" -ForegroundColor DarkGray
Write-Host "        * Alamat" -ForegroundColor DarkGray
Write-Host "        * Nama Bank" -ForegroundColor DarkGray
Write-Host "        * Nomor Rekening" -ForegroundColor DarkGray
Write-Host "        * Nama Pemegang Rekening" -ForegroundColor DarkGray
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Template Excel akan otomatis terdownload" -ForegroundColor White
Write-Host "   - Import akan menampilkan hasil sukses/gagal" -ForegroundColor White
Write-Host "   - Laporan Excel berisi data lengkap semua field" -ForegroundColor White
Write-Host "   - Laporan PDF berisi data ringkas untuk print" -ForegroundColor White
Write-Host ""
