@echo off
echo ========================================
echo Perbaikan dan Menjalankan Aplikasi
echo ========================================
echo.

echo [1/4] Membersihkan cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist tsconfig.tsbuildinfo del /q tsconfig.tsbuildinfo
echo ✓ Cache dibersihkan
echo.

echo [2/4] Building aplikasi...
call npm run build
if errorlevel 1 (
    echo ✗ Build gagal! Periksa error di atas.
    pause
    exit /b 1
)
echo ✓ Build berhasil
echo.

echo [3/4] Menjalankan development server...
echo ✓ Server akan berjalan di http://localhost:3000
echo.
echo Tekan Ctrl+C untuk menghentikan server
echo.

call npm run dev
