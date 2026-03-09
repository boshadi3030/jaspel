/**
 * Test Script: Sidebar Visibility and Logout Functionality
 * 
 * This script verifies:
 * 1. Sidebar component exists and is properly configured
 * 2. Layout files have correct CSS classes for sidebar integration
 * 3. Auth service logout function properly clears storage and redirects
 * 4. All components are properly exported and importable
 */

import { readFileSync } from 'fs'
import { join } from 'path'

interface TestResult {
  name: string
  passed: boolean
  message: string
  details?: string[]
}

const results: TestResult[] = []

function addResult(name: string, passed: boolean, message: string, details?: string[]) {
  results.push({ name, passed, message, details })
}

function checkFileContains(filePath: string, patterns: { pattern: string | RegExp, description: string }[]): boolean {
  try {
    const content = readFileSync(join(process.cwd(), filePath), 'utf-8')
    const failures: string[] = []
    
    for (const { pattern, description } of patterns) {
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
      if (!regex.test(content)) {
        failures.push(`❌ ${description}`)
      } else {
        failures.push(`✅ ${description}`)
      }
    }
    
    const allPassed = failures.every(f => f.startsWith('✅'))
    addResult(
      `File Check: ${filePath}`,
      allPassed,
      allPassed ? 'All checks passed' : 'Some checks failed',
      failures
    )
    
    return allPassed
  } catch (error) {
    addResult(`File Check: ${filePath}`, false, `Error reading file: ${error}`)
    return false
  }
}

console.log('🔍 Testing Sidebar Visibility and Logout Functionality\n')
console.log('=' .repeat(70))

// Test 1: Sidebar Component Structure
console.log('\n📋 Test 1: Sidebar Component Structure')
checkFileContains('components/navigation/Sidebar.tsx', [
  { pattern: /'use client'/, description: 'Client component directive' },
  { pattern: /export default function Sidebar/, description: 'Default export' },
  { pattern: /fixed left-0 top-0 h-screen/, description: 'Desktop sidebar fixed positioning' },
  { pattern: /hidden lg:block/, description: 'Desktop sidebar responsive class' },
  { pattern: /lg:hidden/, description: 'Mobile menu button responsive class' },
  { pattern: /w-72/, description: 'Sidebar width (expanded)' },
  { pattern: /w-20/, description: 'Sidebar width (collapsed)' },
  { pattern: /z-40/, description: 'Sidebar z-index' },
  { pattern: /z-50/, description: 'Mobile overlay z-index' },
  { pattern: /handleLogout/, description: 'Logout handler function' },
  { pattern: /authService\.logout/, description: 'Auth service logout call' },
  { pattern: /window\.location\.replace\('\/login'\)/, description: 'Hard redirect to login' },
  { pattern: /showLogoutDialog/, description: 'Logout confirmation dialog state' },
  { pattern: /useMenuItems/, description: 'Menu items hook' },
  { pattern: /useAuth/, description: 'Auth hook' },
])

// Test 2: Admin Layout Integration
console.log('\n📋 Test 2: Admin Layout Integration')
checkFileContains('app/admin/layout.tsx', [
  { pattern: /import Sidebar/, description: 'Sidebar import' },
  { pattern: /import.*ErrorBoundary/, description: 'ErrorBoundary import' },
  { pattern: /flex h-screen overflow-hidden/, description: 'Flex container with overflow control' },
  { pattern: /<Sidebar \/>/, description: 'Sidebar component rendered' },
  { pattern: /lg:ml-72/, description: 'Main content margin for sidebar space' },
  { pattern: /flex-1 overflow-y-auto/, description: 'Main content flex and scroll' },
  { pattern: /<ErrorBoundary>/, description: 'ErrorBoundary wrapping children' },
])

// Test 3: Manager Layout Integration
console.log('\n📋 Test 3: Manager Layout Integration')
checkFileContains('app/manager/layout.tsx', [
  { pattern: /import Sidebar/, description: 'Sidebar import' },
  { pattern: /import.*ErrorBoundary/, description: 'ErrorBoundary import' },
  { pattern: /flex h-screen overflow-hidden/, description: 'Flex container with overflow control' },
  { pattern: /<Sidebar \/>/, description: 'Sidebar component rendered' },
  { pattern: /lg:ml-72/, description: 'Main content margin for sidebar space' },
  { pattern: /flex-1 overflow-y-auto/, description: 'Main content flex and scroll' },
])

// Test 4: Employee Layout Integration
console.log('\n📋 Test 4: Employee Layout Integration')
checkFileContains('app/employee/layout.tsx', [
  { pattern: /import Sidebar/, description: 'Sidebar import' },
  { pattern: /import.*ErrorBoundary/, description: 'ErrorBoundary import' },
  { pattern: /flex h-screen overflow-hidden/, description: 'Flex container with overflow control' },
  { pattern: /<Sidebar \/>/, description: 'Sidebar component rendered' },
  { pattern: /lg:ml-72/, description: 'Main content margin for sidebar space' },
  { pattern: /flex-1 overflow-y-auto/, description: 'Main content flex and scroll' },
])

// Test 5: Auth Service Logout Implementation
console.log('\n📋 Test 5: Auth Service Logout Implementation')
checkFileContains('lib/services/auth.service.ts', [
  { pattern: /async signOut\(\)/, description: 'signOut method exists' },
  { pattern: /async logout\(\)/, description: 'logout method exists' },
  { pattern: /scope: 'global'/, description: 'Global scope for sign out' },
  { pattern: /localStorage\.clear\(\)/, description: 'localStorage cleanup' },
  { pattern: /sessionStorage\.clear\(\)/, description: 'sessionStorage cleanup' },
  { pattern: /document\.cookie/, description: 'Cookie cleanup' },
  { pattern: /window\.location\.replace\('\/login'\)/, description: 'Hard redirect to login' },
  { pattern: /await new Promise.*setTimeout/, description: 'Delay before redirect' },
])

// Test 6: useAuth Hook
console.log('\n📋 Test 6: useAuth Hook')
checkFileContains('lib/hooks/useAuth.ts', [
  { pattern: /export function useAuth/, description: 'useAuth hook export' },
  { pattern: /export function useMenuItems/, description: 'useMenuItems hook export' },
  { pattern: /useState/, description: 'React useState usage' },
  { pattern: /useEffect/, description: 'React useEffect usage' },
])

// Test 7: RBAC Service
console.log('\n📋 Test 7: RBAC Service')
checkFileContains('lib/services/rbac.service.ts', [
  { pattern: /getMenuItemsForRole/, description: 'getMenuItemsForRole function' },
  { pattern: /superadmin/, description: 'Superadmin role handling' },
  { pattern: /unit_manager/, description: 'Unit manager role handling' },
  { pattern: /employee/, description: 'Employee role handling' },
])

// Print Summary
console.log('\n' + '='.repeat(70))
console.log('\n📊 Test Summary\n')

const passed = results.filter(r => r.passed).length
const failed = results.filter(r => !r.passed).length
const total = results.length

console.log(`Total Tests: ${total}`)
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

if (failed > 0) {
  console.log('\n❌ Failed Tests:\n')
  results.filter(r => !r.passed).forEach(result => {
    console.log(`  • ${result.name}`)
    console.log(`    ${result.message}`)
    if (result.details) {
      result.details.forEach(detail => console.log(`    ${detail}`))
    }
  })
}

console.log('\n' + '='.repeat(70))

if (failed === 0) {
  console.log('\n✅ All tests passed! Sidebar and logout implementation looks good.')
  console.log('\n📝 Next Steps:')
  console.log('   1. Start the development server: npm run dev')
  console.log('   2. Login to the application')
  console.log('   3. Verify sidebar is visible on the left side')
  console.log('   4. Test logout button functionality')
  console.log('   5. Test on mobile view (< 1024px)')
  console.log('   6. Test on desktop view (>= 1024px)')
  process.exit(0)
} else {
  console.log('\n⚠️  Some tests failed. Please review the implementation.')
  process.exit(1)
}
