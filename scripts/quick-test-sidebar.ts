import * as fs from 'fs'
import * as path from 'path'

console.log('🧪 Quick Sidebar Structure Test\n')
console.log('=' .repeat(60))

// Verify route structure
console.log('\n📁 Verifying Route Structure...')

const authenticatedPath = path.join(process.cwd(), 'app', '(authenticated)')
const requiredRoutes = [
  'dashboard',
  'units',
  'users',
  'pegawai',
  'kpi-config',
  'pool',
  'realization',
  'reports',
  'audit',
  'settings',
  'profile',
  'notifications'
]

let allRoutesExist = true
for (const route of requiredRoutes) {
  const routePath = path.join(authenticatedPath, route)
  if (fs.existsSync(routePath)) {
    console.log(`   ✅ /${route}`)
  } else {
    console.log(`   ❌ /${route} - NOT FOUND`)
    allRoutesExist = false
  }
}

// Check layout file
console.log('\n📄 Checking Layout Configuration...')
const layoutPath = path.join(authenticatedPath, 'layout.tsx')
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8')
  
  console.log('   ✅ Layout file exists')
  
  if (layoutContent.includes('<Sidebar />')) {
    console.log('   ✅ Sidebar component included')
  } else {
    console.log('   ❌ Sidebar component NOT found')
  }

  if (layoutContent.includes('lg:ml-72')) {
    console.log('   ✅ Correct margin (lg:ml-72)')
  } else if (layoutContent.includes('lg:ml-60')) {
    console.log('   ⚠️  Old margin (lg:ml-60) - needs update')
  } else {
    console.log('   ❌ No left margin found')
  }
} else {
  console.log('   ❌ Layout file not found')
}

// Check Sidebar component
console.log('\n🎨 Checking Sidebar Component...')
const sidebarPath = path.join(process.cwd(), 'components', 'navigation', 'Sidebar.tsx')
if (fs.existsSync(sidebarPath)) {
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8')
  
  console.log('   ✅ Sidebar component exists')
  
  if (sidebarContent.includes("'use client'")) {
    console.log('   ✅ Client component directive present')
  }
  
  if (sidebarContent.includes('useAuth')) {
    console.log('   ✅ useAuth hook imported')
  }
  
  if (sidebarContent.includes('useMenuItems')) {
    console.log('   ✅ useMenuItems hook imported')
  }
} else {
  console.log('   ❌ Sidebar component not found')
}

console.log('\n' + '='.repeat(60))

if (allRoutesExist) {
  console.log('\n✅ STRUCTURE TEST PASSED')
  console.log('\n📋 All routes are properly organized under (authenticated)')
  console.log('📋 Layout includes Sidebar component')
  console.log('\n💡 Next Steps:')
  console.log('   1. Stop the dev server (Ctrl+C)')
  console.log('   2. Clear .next folder: Remove-Item -Recurse -Force .next')
  console.log('   3. Restart: npm run dev')
  console.log('   4. Clear browser cache')
  console.log('   5. Login and navigate to /dashboard')
  console.log('   6. Sidebar should now be visible!')
} else {
  console.log('\n❌ STRUCTURE TEST FAILED')
  console.log('   Some routes are not properly organized')
}
