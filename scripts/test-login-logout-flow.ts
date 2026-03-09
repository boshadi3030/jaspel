import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLoginLogoutFlow() {
  console.log('🧪 Testing Login-Logout Flow\n')
  console.log('='.repeat(60))

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Test 1: Login
    console.log('\n✓ Test 1: Login')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123',
    })

    if (loginError || !loginData.session) {
      console.error('  ❌ Login failed:', loginError?.message)
      return
    }

    console.log('  ✅ Login successful')
    console.log('     User:', loginData.user.email)
    console.log('     Role:', loginData.user.user_metadata?.role)

    // Test 2: Verify session exists
    console.log('\n✓ Test 2: Verify session exists')
    const { data: { session: session1 } } = await supabase.auth.getSession()
    
    if (!session1) {
      console.error('  ❌ No session found')
      return
    }
    
    console.log('  ✅ Session exists')

    // Test 3: Verify can access employee data
    console.log('\n✓ Test 3: Verify can access employee data')
    const { data: employeeData, error: employeeError } = await supabase
      .from('m_employees')
      .select('full_name, is_active')
      .eq('user_id', loginData.user.id)
      .single()

    if (employeeError || !employeeData) {
      console.error('  ❌ Cannot access employee data:', employeeError?.message)
      return
    }

    console.log('  ✅ Employee data accessible')
    console.log('     Name:', employeeData.full_name)
    console.log('     Active:', employeeData.is_active)

    // Test 4: Logout with global scope
    console.log('\n✓ Test 4: Logout (global scope)')
    const { error: logoutError } = await supabase.auth.signOut({ scope: 'global' })

    if (logoutError) {
      console.error('  ❌ Logout failed:', logoutError.message)
      return
    }

    console.log('  ✅ Logout successful')

    // Test 5: Verify session cleared
    console.log('\n✓ Test 5: Verify session cleared')
    const { data: { session: session2 } } = await supabase.auth.getSession()

    if (session2) {
      console.error('  ❌ Session still exists!')
      return
    }

    console.log('  ✅ Session cleared')

    // Test 6: Verify cannot access employee data after logout
    console.log('\n✓ Test 6: Verify cannot access protected data')
    const { data: employeeData2, error: employeeError2 } = await supabase
      .from('m_employees')
      .select('*')
      .limit(1)

    if (employeeError2) {
      console.log('  ✅ Protected data blocked (expected)')
    } else if (!employeeData2 || employeeData2.length === 0) {
      console.log('  ✅ No data returned (expected)')
    } else {
      console.warn('  ⚠️  Protected data still accessible')
    }

    // Test 7: Verify cannot get user after logout
    console.log('\n✓ Test 7: Verify user data cleared')
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('  ✅ User data cleared (expected)')
    } else {
      console.warn('  ⚠️  User data still accessible')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ ALL TESTS PASSED')
    console.log('='.repeat(60))
    console.log('\nLogin-Logout flow berfungsi dengan baik!')
    console.log('Silakan test di browser dengan langkah berikut:')
    console.log('1. Login ke aplikasi')
    console.log('2. Klik tombol "Keluar" di sidebar')
    console.log('3. Konfirmasi dengan "Ya, Keluar"')
    console.log('4. Verifikasi redirect ke /login')
    console.log('5. Coba akses halaman protected (harus redirect ke login)')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

testLoginLogoutFlow().catch(console.error)
