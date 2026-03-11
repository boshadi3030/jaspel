#!/usr/bin/env tsx

/**
 * Script untuk memperbaiki masalah chunk loading secara final
 * Mengatasi error 404 pada file JavaScript dan CSS
 */

import { execSync } from 'child_process'
import { existsSync, rmSync } from 'fs'
import path from 'path'

console.log('🔧 Memulai perbaikan chunk loading final...')

try {
  // 1. Stop semua proses Node.js yang berjalan
  console.log('⏹️  Menghentikan proses Node.js...')
  try {
    execSync('taskkill /f /im node.exe', { stdio: 'ignore' })
  } catch (error) {
    // Ignore error jika tidak ada proses node yang berjalan
  }

  // 2. Hapus cache dan build files
  console.log('🗑️  Membersihkan cache dan build files...')
  const pathsToClean = [
    '.next',
    'node_modules/.cache',
    '.vercel',
    'tsconfig.tsbuildinfo'
  ]

  pathsToClean.forEach(pathToClean => {
    if (existsSync(pathToClean)) {
      rmSync(pathToClean, { recursive: true, force: true })
      console.log(`   ✅ Dihapus: ${pathToClean}`)
    }
  })

  // 3. Clear npm cache
  console.log('🧹 Membersihkan npm cache...')
  execSync('npm cache clean --force', { stdio: 'inherit' })

  // 4. Reinstall dependencies
  console.log('📦 Menginstall ulang dependencies...')
  execSync('npm install', { stdio: 'inherit' })

  // 5. Build aplikasi dengan konfigurasi baru
  console.log('🏗️  Building aplikasi dengan konfigurasi baru...')
  execSync('npm run build', { stdio: 'inherit' })

  console.log('✅ Perbaikan chunk loading selesai!')
  console.log('🚀 Silakan jalankan: npm run dev')

} catch (error) {
  console.error('❌ Error saat memperbaiki chunk loading:', error)
  process.exit(1)
}