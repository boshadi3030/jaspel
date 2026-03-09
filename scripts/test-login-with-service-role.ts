import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testLoginWithServiceRole() {
  console.log('🧪 Testing Login with Service Role Key...\n')

  // Create client with service role (bypasses RLS)
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

  const email = 'mukhsin9@gmail.com'

  console.log('1️⃣ Checking if user exists in auth.users...')
  const { data: authUsers, error: authError } = await supabaseService.auth.admin.listUsers()
  
  if (authError) {
    console.error('❌ Failed to list users:', authError.message)
    return
  }

  const authUser = authUsers.users.find(u => u.email === email)
  
  if (!authUser) {
    console.error('❌ User not found in auth.users')
    return
  }

  console.log('✅ User found in auth.users')
  console.log('   ID:', authUser.id)
  console.log('   Email:', authUser.email)

  console.log('\n2️⃣ Checking t_user table...')
  const { data: userData, error: userError } = await supabaseService
    .from('t_user')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (userError) {
    console.error('❌ Failed to fetch from t_user:', userError.message)
    console.log('\n🔧 Attempting to create t_user record...')
    
    // Try to create the record
    const { data: newUser, error: createError } = await supabaseService
      .from('t_user')
      .insert({
        id: authUser.id,
        email: authUser.email,
        role: 'superadmin',
        is_active: true
      })
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Failed to create t_user:', createError.message)
      return
    }
    
    console.log('✅ Created t_user record')
    console.log('   User:', newUser)
  } else {
    console.log('✅ User found in t_user')
    console.log('   ID:', userData.id)
    console.log('   Email:', userData.email)
    console.log('   Role:', userData.role)
    console.log('   Employee ID:', userData.employee_id)
    console.log('   Active:', userData.is_active)
  }

  console.log('\n3️⃣ Checking m_employees if employee_id exists...')
  if (userData?.employee_id) {
    const { data: employeeData, error: employeeError } = await supabaseService
      .from('m_employees')
      .select('*')
      .eq('id', userData.employee_id)
      .single()

    if (employeeError) {
      console.error('❌ Failed to fetch employee:', employeeError.message)
    } else {
      console.log('✅ Employee data found')
      console.log('   Full Name:', employeeData.full_name)
      console.log('   Unit ID:', employeeData.unit_id)
      console.log('   Employee Code:', employeeData.employee_code)
    }
  } else {
    console.log('⚠️ No employee_id linked')
  }

  console.log('\n✅ Diagnosis complete!')
}

testLoginWithServiceRole().catch(console.error)
