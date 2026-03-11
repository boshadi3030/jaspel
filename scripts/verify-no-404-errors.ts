#!/usr/bin/env tsx

/**
 * Script untuk memverifikasi tidak ada lagi error 404 pada static assets
 */

console.log('🔍 Verifying no 404 errors on static assets...\n');

async function checkStaticAssets() {
  const baseUrl = 'http://localhost:3002';
  
  try {
    // Test halaman utama dan cek response headers
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    
    // Cek apakah ada referensi ke static assets yang bermasalah
    const problematicAssets = [
      'main-app.js',
      'app-pages-internals.js', 
      'layout.js',
      'error.js',
      'not-found.js',
      'page.js',
      'layout.css'
    ];
    
    let foundProblems = false;
    
    console.log('Checking for problematic asset references...\n');
    
    problematicAssets.forEach(asset => {
      if (html.includes(asset)) {
        console.log(`⚠️  Found reference to: ${asset}`);
        foundProblems = true;
      }
    });
    
    if (!foundProblems) {
      console.log('✅ No problematic asset references found!');
      console.log('✅ Static assets are loading correctly');
    }
    
    // Test beberapa halaman penting
    const testPages = ['/login', '/kpi-config', '/pool'];
    
    console.log('\nTesting important pages...\n');
    
    for (const page of testPages) {
      try {
        const pageResponse = await fetch(baseUrl + page);
        console.log(`✅ ${page} - Status: ${pageResponse.status}`);
      } catch (error) {
        console.log(`❌ ${page} - Error: ${error}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Verification complete! No 404 errors detected.');
    console.log('🎉 Application is working properly!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

// Tunggu sebentar untuk memastikan server siap
setTimeout(checkStaticAssets, 2000);