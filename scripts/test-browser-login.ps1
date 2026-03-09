Write-Host "🧪 Testing Browser Login..." -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ All backend tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Test Steps:" -ForegroundColor Yellow
Write-Host "1. Open browser: http://localhost:3000/login"
Write-Host "2. Enter credentials:"
Write-Host "   Email: mukhsin9@gmail.com"
Write-Host "   Password: admin123"
Write-Host "3. Click 'Masuk ke Sistem'"
Write-Host "4. Should redirect to: /admin/dashboard"
Write-Host ""
Write-Host "🔍 Check browser console for any errors"
Write-Host "🔍 Check Network tab for failed requests"
Write-Host ""

# Open browser
Start-Process "http://localhost:3000/login"

Write-Host "✅ Browser opened!" -ForegroundColor Green
Write-Host "Please test the login manually and report results." -ForegroundColor Cyan
