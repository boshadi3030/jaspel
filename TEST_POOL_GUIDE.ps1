#!/usr/bin/env pwsh

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Pool Guide Download Feature" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking if development server is running..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
    $serverRunning = $true
    Write-Host "✓ Server is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Yellow
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Write-Host "Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "Running test script..." -ForegroundColor Yellow
npx tsx scripts/test-pool-guide.ts

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3002/pool in your browser" -ForegroundColor White
Write-Host "2. Click the 'Unduh Petunjuk' button (amber/yellow color)" -ForegroundColor White
Write-Host "3. Verify the PDF downloads and opens correctly" -ForegroundColor White
Write-Host "4. Check all sections are present and professional" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
