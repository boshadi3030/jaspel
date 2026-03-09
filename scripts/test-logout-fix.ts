import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLogout() {
  console.log('🧪 Testing Logout Functionality\n')
  console.log('=' .repeat(60))

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Step 1: Login first
    console.log('\n📝 Step 1: Login with test user')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123',
    })

    if (loginError || !loginData.session) {
      console.error('❌ Login failed:', loginError?.message)
      return
    }

    console.log('✅ Login successful')
    console.log('   User ID:', loginData.user.id)
    console.log('   Email:', loginData.user.email)
    console.log('   Session exists:', !!loginData.session)

    // Step 2: Verify session exists
    console.log('\n📝 Step 2: Verify session exists')
    const { data: { session: beforeSession } } = await supabase.auth.getSession()
    
    if (!beforeSession) {
      console.error('❌ No session found after login')
      return
    }
    
    console.log('✅ Session verified')
    console.log('   Access token exists:', !!beforeSession.access_token)
    console.log('   Refresh token exists:', !!beforeSession.refresh_token)

    // Step 3: Perform logout with global scope
    console.log('\n📝 Step 3: Perform logout (global scope)')
    const { error: logoutError } = await supabase.auth.signOut({ scope: 'global' })

    if (logoutError) {
      console.error('❌ Logout failed:', logoutError.message)
      return
    }

    console.log('✅ Logout successful')

    // Step 4: Verify session is cleared
    console.log('\n📝 Step 4: Verify session is cleared')
    const { data: { session: afterSession } } = await supabase.auth.getSession()

    if (afterSession) {
      console.error('❌ Session still exists after logout!')
      console.error('   Access token:', afterSession.access_token?.substring(0, 20) + '...')
      return
    }

    console.log('✅ Session cleared successfully')

    // Step 5: Verify user cannot access protected data
    console.log('\n📝 Step 5: Verify user cannot access protected data')
    const { data: employeeData, error: employeeError } = await supabase
      .from('m_employees')
      .select('*')
      .limit(1)

    if (employeeError) {
      console.log('✅ Protected data access blocked (expected)')
      console.log('   Error:', employeeError.message)
    } else if (!employeeData || employeeData.length === 0) {
      console.log('✅ No data returned (expected)')
    } else {
      console.warn('⚠️  Protected data still accessible (unexpected)')
    }

    // Step 6: Verify cannot get current user
    console.log('\n📝 Step 6: Verify cannot get current user')
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()

    if (userError || !currentUser) {
      console.log('✅ User data cleared (expected)')
      if (userError) {
        console.log('   Error:', userError.message)
      }
    } else {
      console.warn('⚠️  User data still accessible (unexpected)')
      console.warn('   User ID:', currentUser.id)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ LOGOUT TEST COMPLETED SUCCESSFULLY')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ Test failed with exception:', error)
  }
}

// Run the test
testLogout().catch(console.error)
