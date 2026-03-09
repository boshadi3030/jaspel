import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function verifyImplementation() {
  console.log('🔍 Verifying Simple Supabase Auth Implementation\n')
  
  let allPassed = true
  
  // Check 1: Verify files exist
  console.log('✓ Check 1: Required files exist')
  const requiredFiles = [
    'lib/supabase/client.ts',
    'lib/supabase/server.ts',
    'lib/services/auth.service.ts',
    'app/login/page.tsx',
    'middleware.ts',
  ]
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`)
    } else {
      console.log(`  ❌ ${file} - MISSING`)
      allPassed = false
    }
  }
  
  // Check 2: Verify no JWT libraries
  console.log('\n✓ Check 2: No JWT libraries in package.json')
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
  const jwtLibs = ['jsonwebtoken', 'jose', 'jwt-decode']
  
  let hasJWT = false
  for (const lib of jwtLibs) {
    if (allDeps[lib]) {
      console.log(`  ❌ Found JWT library: ${lib}`)
      hasJWT = true
      allPassed = false
    }
  }
  
  if (!hasJWT) {
    console.log('  ✅ No JWT libraries found')
  }
  
  // Check 3: Verify Supabase SSR package
  console.log('\n✓ Check 3: Supabase SSR package installed')
  if (allDeps['@supabase/ssr']) {
    console.log(`  ✅ @supabase/ssr version ${allDeps['@supabase/ssr']}`)
  } else {
    console.log('  ❌ @supabase/ssr not found')
    allPassed = false
  }
  
  // Check 4: Test authentication
  console.log('\n✓ Check 4: Authentication works')
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mukhsin9@gmail.com',
    password: 'admin123',
  })
  
  if (authError) {
    console.log('  ❌ Login failed:', authError.message)
    allPassed = false
  } else {
    console.log('  ✅ Login successful')
    
    // Check 5: Verify user data fetch
    console.log('\n✓ Check 5: User data fetch works')
    const { data: userData, error: userError } = await supabase
      .from('m_employees')
      .select('id, email, role, is_active')
      .eq('email', authData.user?.email)
      .single()
    
    if (userError) {
      console.log('  ❌ User fetch failed:', userError.message)
      allPassed = false
    } else {
      console.log('  ✅ User data fetched')
      console.log(`     Role: ${userData.role}`)
      console.log(`     Active: ${userData.is_active}`)
    }
    
    // Check 6: Verify session
    console.log('\n✓ Check 6: Session management works')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      console.log('  ✅ Session exists')
    } else {
      console.log('  ❌ No session found')
      allPassed = false
    }
    
    // Check 7: Verify logout
    console.log('\n✓ Check 7: Logout works')
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.log('  ❌ Logout failed:', logoutError.message)
      allPassed = false
    } else {
      console.log('  ✅ Logout successful')
      
      const { data: { session: afterLogout } } = await supabase.auth.getSession()
      if (afterLogout) {
        console.log('  ❌ Session still exists after logout')
        allPassed = false
      } else {
        console.log('  ✅ Session cleared')
      }
    }
  }
  
  // Check 8: Verify file simplicity
  console.log('\n✓ Check 8: Implementation is simple')
  const clientCode = fs.readFileSync('lib/supabase/client.ts', 'utf-8')
  const serverCode = fs.readFileSync('lib/supabase/server.ts', 'utf-8')
  
  if (clientCode.length < 500 && serverCode.length < 500) {
    console.log('  ✅ Supabase clients are simple and minimal')
  } else {
    console.log('  ⚠️  Supabase clients might be too complex')
  }
  
  // Final result
  console.log('\n' + '='.repeat(50))
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED!')
    console.log('Simple Supabase Auth is correctly implemented.')
  } else {
    console.log('❌ SOME CHECKS FAILED')
    console.log('Please review the errors above.')
  }
  console.log('='.repeat(50))
  
  return allPassed
}

verifyImplementation()
  .then(passed => process.exit(passed ? 0 : 1))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
