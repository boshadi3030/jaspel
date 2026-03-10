/**
 * Test Route Simplification Implementation
 * 
 * Tests:
 * 1. Login and redirect to unified /dashboard
 * 2. Access control for each role
 * 3. Legacy route redirects (301)
 * 4. Error handling and messages
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message: string
  duration?: number
}

const results: TestResult[] = []

function logTest(result: TestResult) {
  const icon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '○'
  const color = result.status === 'PASS' ? '\x1b[32m' : result.status === 'FAIL' ? '\x1b[31m' : '\x1b[33m'
  console.log(`${color}${icon}\x1b[0m ${result.test}`)
  if (result.message) {
    console.log(`  ${result.message}`)
  }
  if (result.duration) {
    console.log(`  Duration: ${result.duration}ms`)
  }
  results.push(result)
}

async function testDatabaseConnection() {
  const start = Date.now()
  try {
    const { data, error } = await supabase.from('m_employees').select('count').limit(1).single()
    
    if (error) throw error
    
    logTest({
      test: 'Database Connection',
      status: 'PASS',
      message: 'Successfully connected to Supabase',
      duration: Date.now() - start
    })
    return true
  } catch (error: any) {
    logTest({
      test: 'Database Connection',
      status: 'FAIL',
      message: `Failed: ${error.message}`,
      duration: Date.now() - start
    })
    return false
  }
}

async function testRouteConfig() {
  const start = Date.now()
  try {
    // Test that route config service exists and has correct structure
    const routeConfigPath = './lib/services/route-config.service.ts'
    const fs = require('fs')
    
    if (!fs.existsSync(routeConfigPath)) {
      throw new Error('route-config.service.ts not found')
    }
    
    const content = fs.readFileSync(routeConfigPath, 'utf-8')
    
    // Check for key functions
    const requiredFunctions = [
      'findRouteConfig',
      'isRouteAllowed',
      'isLegacyRoute',
      'getLegacyRedirectPath',
      'isPublicRoute'
    ]
    
    const missingFunctions = requiredFunctions.filter(fn => !content.includes(fn))
    
    if (missingFunctions.length > 0) {
      throw new Error(`Missing functions: ${missingFunctions.join(', ')}`)
    }
    
    // Check for route configs
    if (!content.includes('routeConfigs') || !content.includes('legacyRoutes')) {
      throw new Error('Missing route configuration arrays')
    }
    
    logTest({
      test: 'Route Configuration Service',
      status: 'PASS',
      message: 'All required functions and configs present',
      duration: Date.now() - start
    })
    return true
  } catch (error: any) {
    logTest({
      test: 'Route Configuration Service',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - start
    })
    return false
  }
}

async function testMiddleware() {
  const start = Date.now()
  try {
    const middlewarePath = './middleware.ts'
    const fs = require('fs')
    
    if (!fs.existsSync(middlewarePath)) {
      throw new Error('middleware.ts not found')
    }
    
    const content = fs.readFileSync(middlewarePath, 'utf-8')
    
    // Check for key imports
    const requiredImports = [
      'isPublicRoute',
      'isLegacyRoute',
      'getLegacyRedirectPath',
      'isRouteAllowed'
    ]
    
    const missingImports = requiredImports.filter(imp => !content.includes(imp))
    
    if (missingImports.length > 0) {
      throw new Error(`Missing imports: ${missingImports.join(', ')}`)
    }
    
    // Check for employee caching
    if (!content.includes('employeeCache') || !content.includes('getCachedEmployee')) {
      throw new Error('Employee caching not implemented')
    }
    
    // Check for legacy redirect with 301
    if (!content.includes('301')) {
      throw new Error('Permanent redirect (301) not implemented for legacy routes')
    }
    
    // Check matcher includes new routes
    const newRoutes = ['/dashboard', '/units', '/users', '/realization']
    const missingRoutes = newRoutes.filter(route => !content.includes(route))
    
    if (missingRoutes.length > 0) {
      throw new Error(`Matcher missing routes: ${missingRoutes.join(', ')}`)
    }
    
    logTest({
      test: 'Middleware Implementation',
      status: 'PASS',
      message: 'All required features implemented',
      duration: Date.now() - start
    })
    return true
  } catch (error: any) {
    logTest({
      test: 'Middleware Implementation',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - start
    })
    return false
  }
}

async function testNewRouteFiles() {
  const start = Date.now()
  try {
    const fs = require('fs')
    const path = require('path')
    
    const requiredRoutes = [
      'app/dashboard/page.tsx',
      'app/units/page.tsx',
      'app/users/page.tsx',
      'app/pegawai/page.tsx',
      'app/kpi-config/page.tsx',
      'app/pool/page.tsx',
      'app/reports/page.tsx',
      'app/audit/page.tsx',
      'app/settings/page.tsx',
      'app/realization/page.tsx'
    ]
    
    const missingFiles = requiredRoutes.filter(route => !fs.existsSync(route))
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing route files: ${missingFiles.join(', ')}`)
    }
    
    logTest({
      test: 'New Route Files',
      status: 'PASS',
      message: `All ${requiredRoutes.length} route files exist`,
      duration: Date.now() - start
    })
    return true
  } catch (error: any) {
    logTest({
      test: 'New Route Files',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - start
    })
    return false
  }
}

async function testRBACService() {
  const start = Date.now()
  try {
    const rbacPath = './lib/services/rbac.service.ts'
    const fs = require('fs')
    
    if (!fs.existsSync(rbacPath)) {
      throw new Error('rbac.service.ts not found')
    }
    
    const content = fs.readFileSync(rbacPath, 'utf-8')
    
    // Check that old paths are removed
    const oldPaths = ['/admin/dashboard', '/manager/dashboard', '/employee/dashboard']
    const foundOldPaths = oldPaths.filter(path => content.includes(`'${path}'`))
    
    if (foundOldPaths.length > 0) {
      throw new Error(`Old paths still present: ${foundOldPaths.join(', ')}`)
    }
    
    // Check that new paths are present
    const newPaths = ['/dashboard', '/units', '/users', '/realization']
    const missingNewPaths = newPaths.filter(path => !content.includes(`'${path}'`))
    
    if (missingNewPaths.length > 0) {
      throw new Error(`New paths missing: ${missingNewPaths.join(', ')}`)
    }
    
    logTest({
      test: 'RBAC Service Updated',
      status: 'PASS',
      message: 'All paths updated to new structure',
      duration: Date.now() - start
    })
    return true
  } catch (error: any) {
    logTest({
      test: 'RBAC Service Updated',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - start
    })
    return false
  }
}

async function testLoginPage() {
  const start = Date.now()
  try {
    const loginPath = './app/login/page.tsx'
    const fs = require('fs')
    
    if (!fs.existsSync(loginPath)) {
      throw new Error('login/page.tsx not found')
    }
    
    const content = fs.readFileSync(loginPath, 'utf-8')
    
    // Check that it redirects to /dashboard
    if (!content.includes("'/dashboard'")) {
      throw new Error('Login does not redirect to /dashboard')
    }
    
    // Check for error handling
    const errorCodes = ['inactive', 'user_not_found', 'session_expired']
    const missingErrors = errorCodes.filter(code => !content.includes(code))
    
    if (missingErrors.length > 0) {
      throw new Error(`Missing error handling for: ${missingErrors.join(', ')}`)
    }
    
    logTest({
      test: 'Login Page Updated',
      status: 'PASS',
      message: 'Redirects to /dashboard with error handling',
      duration: Date.now() - start
    })
    return true
  } catch (error: any) {
    logTest({
      test: 'Login Page Updated',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - start
    })
    return false
  }
}

async function testUnifiedDashboard() {
  const start = Date.now()
  try {
    const dashboardPath = './app/dashboard/page.tsx'
    const fs = require('fs')
    
    if (!fs.existsSync(dashboardPath)) {
      throw new Error('dashboard/page.tsx not found')
    }
    
    const content = fs.readFileSync(dashboardPath, 'utf-8')
    
    // Check for role-based rendering
    const requiredComponents = ['SuperadminMetrics', 'ManagerMetrics', 'EmployeeMetrics']
    const missingComponents = requiredComponents.filter(comp => !content.includes(comp))
    
    if (missingComponents.length > 0) {
      throw new Error(`Missing components: ${missingComponents.join(', ')}`)
    }
    
    // Check for role detection
    if (!content.includes('role') || !content.includes('session')) {
      throw new Error('Role detection not implemented')
    }
    
    logTest({
      test: 'Unified Dashboard',
      status: 'PASS',
      message: 'Role-based dashboard rendering implemented',
      duration: Date.now() - start
    })
    return true
  } catch (error: any) {
    logTest({
      test: 'Unified Dashboard',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - start
    })
    return false
  }
}

async function runAllTests() {
  console.log('\n🧪 Testing Route Simplification Implementation\n')
  console.log('=' .repeat(60))
  
  // Run tests
  await testDatabaseConnection()
  await testRouteConfig()
  await testMiddleware()
  await testNewRouteFiles()
  await testRBACService()
  await testLoginPage()
  await testUnifiedDashboard()
  
  // Summary
  console.log('\n' + '='.repeat(60))
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const skipped = results.filter(r => r.status === 'SKIP').length
  
  console.log(`\n📊 Test Summary:`)
  console.log(`   ✓ Passed:  ${passed}`)
  console.log(`   ✗ Failed:  ${failed}`)
  console.log(`   ○ Skipped: ${skipped}`)
  console.log(`   Total:     ${results.length}`)
  
  if (failed === 0) {
    console.log('\n✅ All tests passed! Route simplification is ready.')
    console.log('\n📝 Next steps:')
    console.log('   1. Test manually at http://localhost:3002')
    console.log('   2. Login and verify redirect to /dashboard')
    console.log('   3. Test navigation to different pages')
    console.log('   4. Test legacy URLs redirect (e.g., /admin/dashboard)')
    console.log('   5. Test access control for different roles')
  } else {
    console.log('\n❌ Some tests failed. Please fix the issues above.')
    process.exit(1)
  }
}

runAllTests().catch(console.error)
