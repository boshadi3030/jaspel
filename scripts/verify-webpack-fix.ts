/**
 * Verify Webpack Fix
 * Memverifikasi bahwa semua module dan dependencies terinstall dengan benar
 */

import { existsSync } from 'fs';
import { join } from 'path';

interface VerificationResult {
  name: string;
  status: 'OK' | 'MISSING' | 'ERROR';
  message?: string;
}

const results: VerificationResult[] = [];

// Critical packages yang harus ada
const criticalPackages = [
  'autoprefixer',
  'postcss',
  'tailwindcss',
  'next',
  'react',
  'react-dom',
  '@supabase/supabase-js',
  '@supabase/ssr',
  'decimal.js',
  'lucide-react',
];

// Critical files yang harus ada
const criticalFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'tsconfig.json',
  '.env.local',
  'app/layout.tsx',
  'app/globals.css',
];

console.log('╔════════════════════════════════════════════╗');
console.log('║   VERIFIKASI WEBPACK FIX                   ║');
console.log('╚════════════════════════════════════════════╝\n');

// Check packages
console.log('📦 Memeriksa packages...\n');
for (const pkg of criticalPackages) {
  const pkgPath = join(process.cwd(), 'node_modules', pkg);
  if (existsSync(pkgPath)) {
    results.push({ name: pkg, status: 'OK' });
    console.log(`✓ ${pkg}`);
  } else {
    results.push({ name: pkg, status: 'MISSING', message: 'Package tidak ditemukan' });
    console.log(`✗ ${pkg} - MISSING`);
  }
}

// Check files
console.log('\n📄 Memeriksa file konfigurasi...\n');
for (const file of criticalFiles) {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    results.push({ name: file, status: 'OK' });
    console.log(`✓ ${file}`);
  } else {
    results.push({ name: file, status: 'MISSING', message: 'File tidak ditemukan' });
    console.log(`✗ ${file} - MISSING`);
  }
}

// Check build artifacts
console.log('\n🗂️  Memeriksa build artifacts...\n');
const nextPath = join(process.cwd(), '.next');
const cachePath = join(process.cwd(), 'node_modules', '.cache');

if (existsSync(nextPath)) {
  console.log('⚠️  .next folder ada (akan dibuat ulang saat build)');
} else {
  console.log('✓ .next folder bersih');
}

if (existsSync(cachePath)) {
  console.log('⚠️  node_modules/.cache ada (akan dibuat ulang saat build)');
} else {
  console.log('✓ cache folder bersih');
}

// Summary
console.log('\n╔════════════════════════════════════════════╗');
console.log('║   RINGKASAN                                ║');
console.log('╚════════════════════════════════════════════╝\n');

const okCount = results.filter(r => r.status === 'OK').length;
const missingCount = results.filter(r => r.status === 'MISSING').length;
const errorCount = results.filter(r => r.status === 'ERROR').length;

console.log(`Total checks: ${results.length}`);
console.log(`✓ OK: ${okCount}`);
console.log(`✗ Missing: ${missingCount}`);
console.log(`✗ Error: ${errorCount}`);

if (missingCount > 0 || errorCount > 0) {
  console.log('\n⚠️  Ada masalah yang perlu diperbaiki!');
  console.log('\nJalankan salah satu:');
  console.log('1. .\\PERBAIKI_WEBPACK_ERROR.ps1 (pilih opsi 1 untuk quick fix)');
  console.log('2. npm install --legacy-peer-deps (manual install)');
  process.exit(1);
} else {
  console.log('\n✓ Semua verifikasi berhasil!');
  console.log('\nAnda dapat menjalankan:');
  console.log('npm run dev');
  process.exit(0);
}
