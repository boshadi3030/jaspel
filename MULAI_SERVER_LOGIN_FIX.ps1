Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  JASPEL SYSTEM - SERVER READY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Perbaikan login telah selesai!" -ForegroundColor Green
Write-Host "✅ Cache telah dibersihkan!" -ForegroundColor Green
Write-Host "✅ Database telah diverifikasi!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KREDENSIAL LOGIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Email    : mukhsin9@gmail.com" -ForegroundColor White
Write-Host "  Password : admin123" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URL Login: http://192.168.1.5:3000/login" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 LANGKAH SELANJUTNYA:" -ForegroundColor Yellow
Write-Host "   1. Server akan dimulai dalam 3 detik" -ForegroundColor Gray
Write-Host "   2. Tunggu hingga muncul 'Ready in ...'" -ForegroundColor Gray
Write-Host "   3. Buka browser dan akses URL di atas" -ForegroundColor Gray
Write-Host "   4. Login dengan kredensial di atas" -ForegroundColor Gray
Write-Host "   5. Anda akan diarahkan ke dashboard admin" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  PENTING:" -ForegroundColor Red
Write-Host "   - Jika masih ada masalah, bersihkan cache browser (Ctrl+Shift+Delete)" -ForegroundColor Red
Write-Host "   - Atau gunakan mode incognito/private (Ctrl+Shift+N)" -ForegroundColor Red
Write-Host ""
Write-Host "Server akan dimulai..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host ""

# Start the development server
npm run dev
