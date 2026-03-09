import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLoginRedirect() {
  console.log('🧪 Testing Login and Redirect Flow\n')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test 1: Login
  console.log('1️⃣ Testing login...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mukhsin9@gmail.com',
    password: 'admin123',
  })
  
  if (authError || !authData.user) {
    console.error('❌ Login failed:', authError?.message)
    return
  }
  
  console.log('✅ Login successful')
  console.log('   User ID:', authData.user.id)
  console.log('   Email:', authData.user.email)
  console.log('   Role:', authData.user.user_metadata?.role)
  
  // Test 2: Check employee data
  console.log('\n2️⃣ Checking employee data...')
  const { data: employee, error: employeeError } = await supabase
    .from('m_employees')
    .select('id, user_id, full_name, unit_id, is_active')
    .eq('user_id', authData.user.id)
    .single()
  
  if (employeeError || !employee) {
    console.error('❌ Employee data not found:', employeeError?.message)
    await supabase.auth.signOut()
    return
  }
  
  console.log('✅ Employee data found')
  console.log('   Employee ID:', employee.id)
  console.log('   Full Name:', employee.full_name)
  console.log('   Unit ID:', employee.unit_id)
  console.log('   Is Active:', employee.is_active)
  
  // Test 3: Check session
  console.log('\n3️⃣ Checking session...')
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    console.error('❌ Session check failed:', sessionError?.message)
    return
  }
  
  console.log('✅ Session valid')
  console.log('   Access Token:', session.access_token.substring(0, 20) + '...')
  console.log('   Expires At:', new Date(session.expires_at! * 1000).toLocaleString())
  
  // Test 4: Simulate middleware check
  console.log('\n4️⃣ Simulating middleware check...')
  const startTime = Date.now()
  
  try {
    const { data: middlewareEmployee, error: middlewareError } = await Promise.race([
      supabase
        .from('m_employees')
        .select('is_active')
        .eq('user_id', session.user.id)
        .single(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      )
    ]) as any
    
    const duration = Date.now() - startTime
    
    if (middlewareError) {
      console.error('❌ Middleware check failed:', middlewareError.message)
    } else {
      console.log('✅ Middleware check passed')
      console.log('   Duration:', duration + 'ms')
      console.log('   Is Active:', middlewareEmployee.is_active)
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('❌ Middleware check timeout:', error.message)
    console.log('   Duration:', duration + 'ms')
  }
  
  // Cleanup
  console.log('\n5️⃣ Cleaning up...')
  await supabase.auth.signOut()
  console.log('✅ Signed out')
  
  console.log('\n✨ Test completed!')
}

testLoginRedirect().catch(console.error)
