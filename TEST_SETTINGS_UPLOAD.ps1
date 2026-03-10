Write-Host "Testing Settings Upload System..." -ForegroundColor Cyan
Write-Host ""

# Run the test
npx tsx scripts/test-settings-upload.ts

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To test manually:" -ForegroundColor Yellow
Write-Host "1. Make sure dev server is running (npm run dev)" -ForegroundColor White
Write-Host "2. Go to http://localhost:3002/settings" -ForegroundColor White
Write-Host "3. Upload a logo and fill in organization details" -ForegroundColor White
Write-Host "4. Click 'Simpan Pengaturan'" -ForegroundColor White
Write-Host "5. Check sidebar for logo and footer for updated text" -ForegroundColor White
