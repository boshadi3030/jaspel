@echo off
echo === Membersihkan Proses dan Cache ===
echo.

echo Membersihkan port 3002...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002" ^| find "LISTENING"') do (
    echo Stopping process %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Membersihkan cache Next.js...
if exist .next (
    rmdir /s /q .next
    echo   Cache .next dihapus
)

if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo   Cache node_modules dihapus
)

echo.
echo === Building Aplikasi ===
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo Build berhasil!
    echo.
    echo === Menjalankan Server ===
    echo Server akan berjalan di http://localhost:3002
    echo Tekan Ctrl+C untuk menghentikan server
    echo.
    call npm run dev
) else (
    echo.
    echo Build gagal! Periksa error di atas.
    pause
    exit /b 1
)
