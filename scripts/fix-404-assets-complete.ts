#!/usr/bin/env tsx

/**
 * Script untuk memperbaiki error 404 pada static assets
 * Membersihkan cache dan rebuild aplikasi
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';

console.log('🔧 Memperbaiki error 404 pada static assets...\n');

// 1. Stop semua proses Node.js yang berjalan
console.log('1. Menghentikan proses Node.js...');
try {
  execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
} catch (error) {
  // Ignore error jika tidak ada proses node yang berjalan
}

// 2. Hapus folder cache dan build
console.log('2. Membersihkan cache dan build folder...');
const foldersToClean = ['.next', 'node_modules/.cache', '.vercel'];

foldersToClean.forEach(folder => {
  if (existsSync(folder)) {
    console.log(`   - Menghapus ${folder}`);
    rmSync(folder, { recursive: true, force: true });
  }
});

// 3. Clear npm cache
console.log('3. Membersihkan npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.log('   - Warning: Gagal membersihkan npm cache');
}

// 4. Reinstall dependencies
console.log('4. Reinstall dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error saat install dependencies:', error);
  process.exit(1);
}

// 5. Build aplikasi
console.log('5. Building aplikasi...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build berhasil!');
} catch (error) {
  console.error('❌ Error saat build:', error);
  process.exit(1);
}

console.log('\n✅ Perbaikan 404 assets selesai!');
console.log('🚀 Jalankan: npm run dev untuk memulai development server');