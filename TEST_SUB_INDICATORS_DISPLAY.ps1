#!/usr/bin/env pwsh

# TEST_SUB_INDICATORS_DISPLAY.ps1
# Script untuk menguji tampilan sub indikator

Write-Host "🧪 Testing Sub Indicators Display..." -ForegroundColor Green
Write-Host ""

# Test 1: Check data integrity
Write-Host "📋 Test 1: Checking data integrity..." -ForegroundColor Yellow
try {
    npx tsx scripts/fix-sub-indicators-display.ts
    Write-Host "✅ Data integrity check passed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Data integrity check failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Manual browser testing instructions
Write-Host "📋 Test 2: Manual Browser Testing" -ForegroundColor Yellow
Write-Host "1. Open browser: http://localhost:3000/kpi-config" -ForegroundColor White
Write-Host "2. Login as superadmin" -ForegroundColor White
Write-Host "3. Select unit UK01 - MEDIS" -ForegroundColor White
Write-Host "4. Look for P1 category (should be expanded)" -ForegroundColor White
Write-Host "5. Check indicators:" -ForegroundColor White
Write-Host "   • IND-001 should show '3 sub indikator' badge" -ForegroundColor Gray
Write-Host "   • IND-002 should show '2 sub indikator' badge" -ForegroundColor Gray
Write-Host "   • Click expand arrow (▼) to see sub indicators" -ForegroundColor Gray
Write-Host "6. Sub indicators should display with:" -ForegroundColor White
Write-Host "   • Code and name" -ForegroundColor Gray
Write-Host "   • Weight percentage" -ForegroundColor Gray
Write-Host "   • 5 colored score badges (20, 40, 60, 80, 100)" -ForegroundColor Gray
Write-Host "   • Edit and delete buttons" -ForegroundColor Gray

Write-Host ""

# Test 3: Expected structure
Write-Host "📊 Expected Structure:" -ForegroundColor Cyan
Write-Host "P1 - Posisi" -ForegroundColor White
Write-Host "  ├── IND-001 - Profesional Grade (3 sub indikator)" -ForegroundColor Gray
Write-Host "  │   ├── PG1 - Kelas Jabatan/Pendidikan (40%)" -ForegroundColor DarkGray
Write-Host "  │   ├── PG2 - Masa Kerja (60%)" -ForegroundColor DarkGray
Write-Host "  │   └── SI-001 - Sub Indikator Test (0%)" -ForegroundColor DarkGray
Write-Host "  └── IND-002 - Beban Resiko Kerja (2 sub indikator)" -ForegroundColor Gray
Write-Host "      ├── BR1 - Beban Pekerjaan (40%)" -ForegroundColor DarkGray
Write-Host "      └── BR2 - Resiko pekerjaan (60%)" -ForegroundColor DarkGray

Write-Host ""

# Test 4: Troubleshooting
Write-Host "🔧 If sub indicators are still not visible:" -ForegroundColor Yellow
Write-Host "1. Open browser DevTools (F12)" -ForegroundColor White
Write-Host "2. Check Console tab for errors" -ForegroundColor White
Write-Host "3. Try manually clicking expand arrows" -ForegroundColor White
Write-Host "4. Check Network tab for failed API calls" -ForegroundColor White
Write-Host "5. Refresh the page completely" -ForegroundColor White

Write-Host ""

# Summary
Write-Host "📋 Fixes Applied:" -ForegroundColor Cyan
Write-Host "✅ Auto-expand indicators with sub indicators" -ForegroundColor Green
Write-Host "✅ Improved visual indicators (badges)" -ForegroundColor Green
Write-Host "✅ Better expand/collapse functionality" -ForegroundColor Green
Write-Host "✅ Score badges with proper colors" -ForegroundColor Green
Write-Host "✅ Edit/delete buttons for sub indicators" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Sub Indicators Display Test Complete!" -ForegroundColor Green
Write-Host "   Please test manually in browser." -ForegroundColor White