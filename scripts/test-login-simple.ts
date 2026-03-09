import { createClient } from '@/lib/supabase/client'

async function testLogin() {
  console.log('🧪 Testing Login Flow...\n')
  
  const supabase = createClient()
  
  // Test credentials
  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'
  
  console.log('📧 Email:', email)
  console.log('🔒 Password: ********\n')
  
  try {
    // Attempt login
    console.log('🔐 Attempting login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return
    }
    
    if (!authData.user) {
      console.error('❌ No user returned')
      return
    }
    
    console.log('✅ Auth successful!')
    console.log('   User ID:', authData.user.id)
    console.log('   Email:', authData.user.email)
    
    // Check session
    console.log('\n🔍 Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message)
      return
    }
    
    if (!session) {
      console.error('❌ No session found')
      return
    }
    
    console.log('✅ Session exists!')
    console.log('   Access token:', session.access_token.substring(0, 20) + '...')
    console.log('   Expires at:', new Date(session.expires_at! * 1000).toLocaleString())
    
    // Check employee data
    console.log('\n👤 Checking employee data...')
    const { data: employee, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, full_name, role, is_active, unit_id')
      .eq('user_id', authData.user.id)
      .single()
    
    if (employeeError) {
      console.error('❌ Employee error:', employeeError.message)
      return
    }
    
    if (!employee) {
      console.error('❌ No employee found')
      return
    }
    
    console.log('✅ Employee found!')
    console.log('   Name:', employee.full_name)
    console.log('   Role:', employee.role)
    console.log('   Active:', employee.is_active)
    console.log('   Unit ID:', employee.unit_id || 'N/A')
    
    // Determine dashboard route
    const dashboardRoute = employee.role === 'superadmin' ? '/admin/dashboard' :
                          employee.role === 'unit_manager' ? '/manager/dashboard' :
                          '/employee/dashboard'
    
    console.log('\n🎯 Should redirect to:', dashboardRoute)
    console.log('\n✅ Login flow test PASSED!')
    
    // Sign out
    console.log('\n🚪 Signing out...')
    await supabase.auth.signOut()
    console.log('✅ Signed out successfully')
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

testLogin()
