@echo off
REM Script untuk restart aplikasi dengan membersihkan cache dan proses
REM Gunakan script ini jika aplikasi mengalami masalah

echo.
echo ========================================
echo   Restarting Application (Clean Mode)
echo ========================================
echo.

REM Step 1: Stop all Node.js processes
echo 1. Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] All Node.js processes stopped
) else (
    echo    [INFO] No Node.js processes found
)

timeout /t 2 /nobreak >nul

REM Step 2: Clean build cache
echo.
echo 2. Cleaning build cache...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
    echo    [OK] Build cache cleaned
) else (
    echo    [INFO] No build cache found
)

timeout /t 1 /nobreak >nul

REM Step 3: Start development server
echo.
echo 3. Starting development server...
echo.
echo ========================================
echo    Server will start at: http://localhost:3000
echo    Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev
