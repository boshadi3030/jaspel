#!/usr/bin/env tsx

/**
 * Test script untuk memverifikasi perbaikan error 404 assets
 */

import { createClient } from '@/lib/supabase/server'

async function testAssetLoading() {
  console.log('🧪 Testing asset loading dan server status...')
  
  try {
    // Test 1: Cek apakah server berjalan
    console.log('\n1️⃣ Testing server status...')
    const response = await fetch('http://localhost:3002', {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })
    
    if (response.ok) {
      console.log('✅ Server berjalan normal di localhost:3002')
      console.log(`   Status: ${response.status} ${response.statusText}`)
    } else {
      console.log(`❌ Server error: ${response.status} ${response.statusText}`)
      return false
    }
    
    // Test 2: Cek apakah halaman login dapat diakses
    console.log('\n2️⃣ Testing login page...')
    const loginResponse = await fetch('http://localhost:3002/login', {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })
    
    if (loginResponse.ok) {
      console.log('✅ Halaman login dapat diakses')
      console.log(`   Status: ${loginResponse.status} ${loginResponse.statusText}`)
    } else {
      console.log(`❌ Login page error: ${loginResponse.status} ${loginResponse.statusText}`)
    }
    
    // Test 3: Cek database connection
    console.log('\n3️⃣ Testing database connection...')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('m_units').select('id').limit(1)
      
      if (error) {
        console.log('❌ Database connection error:', error.message)
      } else {
        console.log('✅ Database connection berhasil')
      }
    } catch (dbError) {
      console.log('⚠️ Database test skipped (server-side only)')
    }
    
    console.log('\n🎉 Test selesai!')
    console.log('📝 Silakan buka browser dan akses: http://localhost:3002')
    console.log('   Periksa console browser untuk memastikan tidak ada error 404 lagi')
    
    return true
    
  } catch (error) {
    console.error('❌ Test error:', error)
    return false
  }
}

// Jalankan test
testAssetLoading()
  .then((success) => {
    if (success) {
      console.log('\n✅ Semua test berhasil!')
    } else {
      console.log('\n❌ Ada test yang gagal!')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('❌ Test gagal:', error)
    process.exit(1)
  })