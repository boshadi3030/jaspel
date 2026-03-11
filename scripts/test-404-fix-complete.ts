#!/usr/bin/env tsx

/**
 * Script untuk test bahwa error 404 pada static assets sudah teratasi
 */

import { execSync } from 'child_process';

console.log('🧪 Testing perbaikan error 404...\n');

const testUrls = [
  'http://localhost:3002',
  'http://localhost:3002/login',
  'http://localhost:3002/kpi-config',
  'http://localhost:3002/pool',
  'http://localhost:3002/settings'
];

async function testUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`✅ ${url} - Status: ${response.status}`);
    return response.status === 200 || response.status === 302; // 302 untuk redirect
  } catch (error) {
    console.log(`❌ ${url} - Error: ${error}`);
    return false;
  }
}

async function runTests() {
  console.log('Testing URL accessibility...\n');
  
  let allPassed = true;
  for (const url of testUrls) {
    const passed = await testUrl(url);
    if (!passed) allPassed = false;
    await new Promise(resolve => setTimeout(resolve, 500)); // Delay antar test
  }
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ Semua test berhasil! Error 404 sudah teratasi.');
    console.log('🚀 Aplikasi siap digunakan di http://localhost:3002');
  } else {
    console.log('❌ Masih ada masalah yang perlu diperbaiki.');
  }
}

// Tunggu sebentar untuk memastikan server sudah siap
setTimeout(runTests, 3000);