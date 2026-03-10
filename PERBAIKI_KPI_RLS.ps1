Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PERBAIKAN RLS KPI CONFIGURATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Memperbaiki RLS policies untuk m_kpi_categories dan m_kpi_indicators..." -ForegroundColor Yellow
Write-Host ""

# Run the fix script
npx tsx scripts/fix-kpi-rls.ts

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SELESAI" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Silakan coba tambah kategori KPI lagi." -ForegroundColor White
Write-Host ""

# Keep window open
Read-Host "Tekan Enter untuk keluar"
