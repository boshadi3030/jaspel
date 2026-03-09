import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLogin() {
  console.log('🧪 Testing Login Function...\n')

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Test credentials
  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'

  console.log('📧 Testing with:', email)
  console.log('🔐 Password: ********\n')

  try {
    // Step 1: Test authentication
    console.log('Step 1: Testing Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    })

    if (authError) {
      console.error('❌ Auth Error:', authError.message)
      return
    }

    if (!authData.user) {
      console.error('❌ No user data returned')
      return
    }

    console.log('✅ Auth successful!')
    console.log('   User ID:', authData.user.id)
    console.log('   Email:', authData.user.email)
    console.log('   Metadata:', JSON.stringify(authData.user.user_metadata, null, 2))

    // Step 2: Test employee data fetch
    console.logta...')
    const { data: employeeData, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, user_id, unit_id, is_active, full_name')
      .eq('user_id', authData.user.id)
      .single()

    if (employeeError) {
      console.error('❌ Employee Error:', employeeError.message)
      await supabase.auth.signOut()
      return
    }

    if (!employeeData) {
      console.error('❌ No employee data found')
      await supabase.auth.signOut()
      return
    }

    console.log('✅ Employee data found!')
    console.log('   Employee ID:', employeeData.id)
    console.log('   Full Name:', employeeData.full_name)
    console.log('   Unit ID:', employeeData.unit_id)
    console.log('   Is Active:', employeeData.is_active)

    /: Check active status
    console.log('\nStep 3: Checking active status...')
    if (!employeeData.is_active) {
      console.error('❌ User is not active')
      await supabase.auth.signOut()
      return
    }

    console.log('✅ User is active!')

    // Step 4: Get role
    console.log('\nStep 4: Getting user role...')
    const metadata = authData.user.user_metadata
    const role = metadata.role

    console.log('✅ Role:', role)

    // Step 5: Determine dashboard route
    console.log('\nshboard route...')
    let dashboardRoute = '/forbidden'
    
    switch (role) {
      case 'superadmin':
      case 'admin':
n function is working correctly.')
    console.log('\n📝 Summary:')
    console.log('   - Authentication: ✅')
    console.log('   - Employee data: ✅')
    console.log('   - Active status: ✅')
    console.log('   - Role detection: ✅')
    console.log('   - Dashboard routing: ✅')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testLogin()
        dashboardRoute = '/admin/dashboard'
        break
      case 'unit_manager':
        dashboardRoute = '/manager/dashboard'
        break
      case 'employee':
        dashboardRoute = '/employee/dashboard'
        break
    }

    console.log('✅ Dashboard route:', dashboardRoute)

    // Clean up
    await supabase.auth.signOut()

    console.log('\n✅ All tests passed! Logi