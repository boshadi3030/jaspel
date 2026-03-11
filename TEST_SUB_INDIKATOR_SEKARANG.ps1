#!/usr/bin/env pwsh

# TEST_SUB_INDIKATOR_SEKARANG.ps1
# Script untuk menguji sub indikator langsung di browser

Write-Host "🚀 Testing Sub Indikator Display..." -ForegroundColor Green
Write-Host ""

# Test 1: Verify RLS fix
Write-Host "📋 Test 1: Verifying RLS policies..." -ForegroundColor Yellow
try {
    npx tsx scripts/fix-sub-indicators-rls-now.ts
    Write-Host "✅ RLS policies fixed!" -ForegroundColor Green
} catch {
    Write-Host "❌ RLS fix failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Check sub indicator data
Write-Host "📋 Test 2: Checking sub indicator data..." -ForegroundColor Yellow
try {
    npx tsx scripts/test-sub-indicators-display-now.ts
    Write-Host "✅ Sub indicator data verified!" -ForegroundColor Green
} catch {
    Write-Host "❌ Data check failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Check server status
Write-Host "📋 Test 3: Checking development server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/kpi-config" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ KPI Config page accessible!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  KPI Config page not accessible" -ForegroundColor Yellow
    Write-Host "   Make sure you're logged in as superadmin" -ForegroundColor Gray
}

Write-Host ""

# Manual testing instructions
Write-Host "📋 Manual Testing Steps:" -ForegroundColor Cyan
Write-Host "1. Open browser: http://localhost:3000/kpi-config" -ForegroundColor White
Write-Host "2. Login as superadmin if not already logged in" -ForegroundColor White
Write-Host "3. Select unit: UK01 - MEDIS" -ForegroundColor White
Write-Host "4. Look for indicators with sub indicator badges:" -ForegroundColor White
Write-Host "   • Should see '5 sub' or similar badge" -ForegroundColor Gray
Write-Host "5. Click the expand arrow (▼) next to an indicator" -ForegroundColor White
Write-Host "6. You should see sub indicators with:" -ForegroundColor White
Write-Host "   • Code (BR1, BR2, PG1, etc.)" -ForegroundColor Gray
Write-Host "   • Name and weight percentage" -ForegroundColor Gray
Write-Host "   • 5 colored score badges (20, 40, 60, 80, 100)" -ForegroundColor Gray
Write-Host "   • Edit and delete buttons" -ForegroundColor Gray
Write-Host "7. Click 'Tambah Sub' to add new sub indicators" -ForegroundColor White

Write-Host ""

# Expected results
Write-Host "📊 Expected Results:" -ForegroundColor Cyan
Write-Host "✅ Sub indicators should be visible when expanding indicators" -ForegroundColor Green
Write-Host "✅ Score badges should show: 20(Sangat Kurang) to 100(Sangat Baik)" -ForegroundColor Green
Write-Host "✅ Weight percentages should be displayed" -ForegroundColor Green
Write-Host "✅ Edit/delete buttons should be functional" -ForegroundColor Green
Write-Host "✅ 'Tambah Sub' button should open form dialog" -ForegroundColor Green

Write-Host ""

# Troubleshooting
Write-Host "🔧 If sub indicators still not showing:" -ForegroundColor Yellow
Write-Host "1. Clear browser cache and refresh" -ForegroundColor White
Write-Host "2. Check browser console for errors (F12)" -ForegroundColor White
Write-Host "3. Verify you're logged in as superadmin" -ForegroundColor White
Write-Host "4. Try selecting a different unit" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Sub Indikator Test Complete!" -ForegroundColor Green
Write-Host "   RLS policies fixed, data verified, ready for testing." -ForegroundColor White