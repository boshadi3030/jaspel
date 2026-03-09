@echo off
echo ========================================
echo Membersihkan Cache Build Next.js
echo ========================================
echo.

echo [1/3] Menghapus folder .next...
if exist .next (
    rmdir /s /q .next
    echo ✓ Folder .next dihapus
) else (
    echo ✓ Folder .next tidak ditemukan
)
echo.

echo [2/3] Menghapus cache node_modules...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ Cache node_modules dihapus
) else (
    echo ✓ Cache node_modules tidak ditemukan
)
echo.

echo [3/3] Menghapus tsconfig.tsbuildinfo...
if exist tsconfig.tsbuildinfo (
    del /q tsconfig.tsbuildinfo
    echo ✓ tsconfig.tsbuildinfo dihapus
) else (
    echo ✓ tsconfig.tsbuildinfo tidak ditemukan
)
echo.

echo ========================================
echo Cache berhasil dibersihkan!
echo ========================================
echo.
echo Langkah selanjutnya:
echo 1. Jalankan: npm run build
echo 2. Jalankan: npm run dev
echo 3. Buka: http://localhost:3000
echo.
pause
