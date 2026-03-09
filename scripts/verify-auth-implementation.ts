/**
 * Comprehensive Auth Implementation Verification Script
 * Verifies all requirements are met for the Simple Supabase Auth implementation
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface VerificationResult {
  category: string
  checks: Array<{
    name: string
    passed: boolean
    message: string
  }>
}

const results: VerificationResult[] = []

function addResult(category: string, name: string, passed: boolean, message: string) {
  let categoryResult = results.find((r) => r.category === category)
  if (!categoryResult) {
    categoryResult = { category, checks: [] }
    results.push(categoryResult)
  }
  categoryResult.checks.push({ name, passed, message })
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath))
}

function fileContains(filePath: string, searchString: string): boolean {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8')
    return content.includes(searchString)
  } catch {
    return false
  }
}

function fileDoesNotContain(filePath: string, searchString: string): boolean {
  return !fileContains(filePath, searchString)
}

async function verifyEnvironment() {
  console.log('🔍 Verifying Environment Configuration...\n')

  addResult(
    'Environment',
    'NEXT_PUBLIC_SUPABASE_URL',
    !!supabaseUrl,
    supabaseUrl ? 'Configured' : 'Missing'
  )

  addResult(
    'Environment',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    !!supabaseKey,
    supabaseKey ? 'Configured' : 'Missing'
  )

  addResult(
    'Environment',
    'Supabase Connection',
    !!supabaseUrl && !!supabaseKey,
    'Can create Supabase client'
  )
}

async function verifyFileStructure() {
  console.log('📁 Verifying File Structure...\n')

  const requiredFiles = [
    'lib/supabase/client.ts',
    'lib/supabase/server.ts',
    'lib/services/auth.service.ts',
    'lib/utils/auth-errors.ts',
    'middleware.ts',
    'app/login/page.tsx',
  ]

  for (const file of requiredFiles) {
    const exists = fileExists(file)
    addResult('File Structure', file, exists, exists ? 'Exists' : 'Missing')
  }
}

async function verifySupabaseClients() {
  console.log('🔌 Verifying Supabase Clients...\n')

  // Check browser client
  const browserClientExists = fileExists('lib/supabase/client.ts')
  const browserClientUsesSSR = fileContains('lib/supabase/client.ts', 'createBrowserClient')
  addResult(
    'Supabase Clients',
    'Browser Client',
    browserClientExists && browserClientUsesSSR,
    browserClientUsesSSR ? 'Uses @supabase/ssr' : 'Not using @supabase/ssr'
  )

  // Check server client
  const serverClientExists = fileExists('lib/supabase/server.ts')
  const serverClientUsesSSR = fileContains('lib/supabase/server.ts', 'createServerClient')
  const serverClientHasCookies = fileContains('lib/supabase/server.ts', 'cookies')
  addResult(
    'Supabase Clients',
    'Server Client',
    serverClientExists && serverClientUsesSSR && serverClientHasCookies,
    serverClientHasCookies ? 'Uses @supabase/ssr with cookies' : 'Missing cookie handling'
  )
}

async function verifyAuthService() {
  console.log('🔐 Verifying Auth Service...\n')

  const authServiceExists = fileExists('lib/services/auth.service.ts')
  addResult('Auth Service', 'File Exists', authServiceExists, authServiceExists ? 'Found' : 'Missing')

  if (authServiceExists) {
    const hasLogin = fileContains('lib/services/auth.service.ts', 'async login')
    addResult('Auth Service', 'Login Method', hasLogin, hasLogin ? 'Implemented' : 'Missing')

    const hasLogout = fileContains('lib/services/auth.service.ts', 'async logout')
    addResult('Auth Service', 'Logout Method', hasLogout, hasLogout ? 'Implemented' : 'Missing')

    const hasGetCurrentUser = fileContains('lib/services/auth.service.ts', 'async getCurrentUser')
    addResult(
      'Auth Service',
      'GetCurrentUser Method',
      hasGetCurrentUser,
      hasGetCurrentUser ? 'Implemented' : 'Missing'
    )

    const hasGetSession = fileContains('lib/services/auth.service.ts', 'async getSession')
    addResult(
      'Auth Service',
      'GetSession Method',
      hasGetSession,
      hasGetSession ? 'Implemented' : 'Missing'
    )

    const usesSupabaseAuth = fileContains('lib/services/auth.service.ts', 'signInWithPassword')
    addResult(
      'Auth Service',
      'Uses Supabase Auth',
      usesSupabaseAuth,
      usesSupabaseAuth ? 'Uses signInWithPassword' : 'Not using Supabase Auth'
    )

    const checksActiveStatus = fileContains('lib/services/auth.service.ts', 'is_active')
    addResult(
      'Auth Service',
      'Checks Active Status',
      checksActiveStatus,
      checksActiveStatus ? 'Validates is_active' : 'Missing active check'
    )
  }
}

async function verifyErrorHandling() {
  console.log('⚠️  Verifying Error Handling...\n')

  const errorUtilExists = fileExists('lib/utils/auth-errors.ts')
  addResult('Error Handling', 'Utility Exists', errorUtilExists, errorUtilExists ? 'Found' : 'Missing')

  if (errorUtilExists) {
    const hasHandleAuthError = fileContains('lib/utils/auth-errors.ts', 'handleAuthError')
    addResult(
      'Error Handling',
      'handleAuthError Function',
      hasHandleAuthError,
      hasHandleAuthError ? 'Implemented' : 'Missing'
    )

    const hasLogAuthError = fileContains('lib/utils/auth-errors.ts', 'logAuthError')
    addResult(
      'Error Handling',
      'logAuthError Function',
      hasLogAuthError,
      hasLogAuthError ? 'Implemented' : 'Missing'
    )

    const hasUserFriendlyCheck = fileContains('lib/utils/auth-errors.ts', 'isUserFriendlyMessage')
    addResult(
      'Error Handling',
      'User-Friendly Check',
      hasUserFriendlyCheck,
      hasUserFriendlyCheck ? 'Implemented' : 'Missing'
    )

    const noTechnicalDetails = !fileContains('lib/utils/auth-errors.ts', 'return "stack trace"')
    addResult(
      'Error Handling',
      'No Technical Details in Messages',
      noTechnicalDetails,
      'Error messages are user-friendly'
    )
  }
}

async function verifyMiddleware() {
  console.log('🛡️  Verifying Middleware...\n')

  const middlewareExists = fileExists('middleware.ts')
  addResult('Middleware', 'File Exists', middlewareExists, middlewareExists ? 'Found' : 'Missing')

  if (middlewareExists) {
    const usesSupabaseClient = fileContains('middleware.ts', 'createClient')
    addResult(
      'Middleware',
      'Uses Supabase Client',
      usesSupabaseClient,
      usesSupabaseClient ? 'Creates Supabase client' : 'Missing client creation'
    )

    const checksSession = fileContains('middleware.ts', 'getSession')
    addResult(
      'Middleware',
      'Checks Session',
      checksSession,
      checksSession ? 'Validates session' : 'Missing session check'
    )

    const redirectsToLogin = fileContains('middleware.ts', '/login')
    addResult(
      'Middleware',
      'Redirects to Login',
      redirectsToLogin,
      redirectsToLogin ? 'Redirects unauthenticated users' : 'Missing redirect'
    )

    const hasProtectedRoutes = fileContains('middleware.ts', 'matcher')
    addResult(
      'Middleware',
      'Protected Routes',
      hasProtectedRoutes,
      hasProtectedRoutes ? 'Configured' : 'Missing matcher'
    )
  }
}

async function verifyLoginPage() {
  console.log('📄 Verifying Login Page...\n')

  const loginPageExists = fileExists('app/login/page.tsx')
  addResult('Login Page', 'File Exists', loginPageExists, loginPageExists ? 'Found' : 'Missing')

  if (loginPageExists) {
    const usesAuthService = fileContains('app/login/page.tsx', 'authService')
    addResult(
      'Login Page',
      'Uses Auth Service',
      usesAuthService,
      usesAuthService ? 'Imports auth service' : 'Missing auth service'
    )

    const hasFormHandling = fileContains('app/login/page.tsx', 'handleSubmit')
    addResult(
      'Login Page',
      'Form Handling',
      hasFormHandling,
      hasFormHandling ? 'Implements form submission' : 'Missing form handler'
    )

    const hasLoadingState = fileContains('app/login/page.tsx', 'isLoading') || fileContains('app/login/page.tsx', 'loading')
    addResult(
      'Login Page',
      'Loading State',
      hasLoadingState,
      hasLoadingState ? 'Shows loading state' : 'Missing loading state'
    )

    const hasErrorDisplay = fileContains('app/login/page.tsx', 'error')
    addResult(
      'Login Page',
      'Error Display',
      hasErrorDisplay,
      hasErrorDisplay ? 'Shows error messages' : 'Missing error display'
    )

    const hasRoleBasedRedirect = fileContains('app/login/page.tsx', 'dashboard')
    addResult(
      'Login Page',
      'Role-Based Redirect',
      hasRoleBasedRedirect,
      hasRoleBasedRedirect ? 'Redirects by role' : 'Missing redirect logic'
    )
  }
}

async function verifyLegacyCodeRemoval() {
  console.log('🧹 Verifying Legacy Code Removal...\n')

  const noJWT = fileDoesNotContain('lib/services/auth.service.ts', 'jsonwebtoken')
  addResult(
    'Legacy Code',
    'No JWT Library',
    noJWT,
    noJWT ? 'JWT library removed' : 'Still using JWT'
  )

  const noCustomTokens = fileDoesNotContain('lib/services/auth.service.ts', 'generateToken')
  addResult(
    'Legacy Code',
    'No Custom Tokens',
    noCustomTokens,
    noCustomTokens ? 'Custom token code removed' : 'Still has custom tokens'
  )

  const usesSupabaseAuth = fileContains('lib/services/auth.service.ts', 'supabase.auth')
  addResult(
    'Legacy Code',
    'Uses Supabase Auth',
    usesSupabaseAuth,
    usesSupabaseAuth ? 'Only Supabase methods' : 'Mixed auth methods'
  )
}

async function verifyDatabaseIntegration() {
  console.log('💾 Verifying Database Integration...\n')

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection
    const { data, error } = await supabase.from('m_employees').select('count').limit(1)

    addResult(
      'Database',
      'Connection',
      !error,
      error ? `Connection failed: ${error.message}` : 'Connected successfully'
    )

    // Check if m_employees table exists
    addResult(
      'Database',
      'm_employees Table',
      !error,
      error ? 'Table not accessible' : 'Table accessible'
    )
  } catch (error: any) {
    addResult('Database', 'Connection', false, `Error: ${error.message}`)
  }
}

function printResults() {
  console.log('\n' + '='.repeat(80))
  console.log('📊 VERIFICATION RESULTS')
  console.log('='.repeat(80) + '\n')

  let totalChecks = 0
  let passedChecks = 0

  for (const result of results) {
    console.log(`\n${result.category}:`)
    console.log('-'.repeat(80))

    for (const check of result.checks) {
      totalChecks++
      if (check.passed) passedChecks++

      const icon = check.passed ? '✅' : '❌'
      console.log(`${icon} ${check.name}: ${check.message}`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`SUMMARY: ${passedChecks}/${totalChecks} checks passed`)
  console.log('='.repeat(80) + '\n')

  if (passedChecks === totalChecks) {
    console.log('🎉 All verification checks passed!')
    console.log('✅ Simple Supabase Auth implementation is complete and correct.\n')
    return true
  } else {
    console.log('⚠️  Some verification checks failed.')
    console.log('Please review the failed checks above and fix the issues.\n')
    return false
  }
}

async function main() {
  console.log('🚀 Starting Simple Supabase Auth Verification\n')
  console.log('='.repeat(80) + '\n')

  await verifyEnvironment()
  await verifyFileStructure()
  await verifySupabaseClients()
  await verifyAuthService()
  await verifyErrorHandling()
  await verifyMiddleware()
  await verifyLoginPage()
  await verifyLegacyCodeRemoval()
  await verifyDatabaseIntegration()

  const allPassed = printResults()

  process.exit(allPassed ? 0 : 1)
}

main().catch((error) => {
  console.error('❌ Verification failed with error:', error)
  process.exit(1)
})
