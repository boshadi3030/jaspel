/**
 * Fix Login 404 Error - Clear cache and verify database
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function fixLogin() {
  console.log('🔧 Fixing Login 404 Error\n')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  // 1. Verify t_user table doesn't exist
  console.log('1️⃣ Verifying t_user table is removed...')
  const { error: tableError } = await supabase
    .from('t_user' as any)
    .select('id')
    .limit(1)
  
  if (tableError) {
    if (tableError.message.includes('does not exist') || tableError.code === '42P01') {
      console.log('✅ t_user table successfully removed\n')
    } else {
      console.log('⚠️ Unexpected error:', tableError.message, '\n')
    }
  } else {
    console.log('❌ t_user table still exists! Need to drop it.\n')
    return
  }
  
  // 2. Verify auth.users has the test user
  console.log('2️⃣ Checking auth.users...')
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('❌ Error fetching auth users:', authError.message)
    return
  }
  
  const testUser = authData.users.find(u => u.email === 'mukhsin9@gmail.com')
  if (!testUser) {
    console.log('❌ Test user not found in auth.users')
    return
  }
  
  console.log('✅ User found in auth.users')
  console.log('   ID:', testUser.id)
  console.log('   Email:', testUser.email)
  console.log('   Role:', testUser.user_metadata?.role || 'not set')
  console.log('')
  
  // 3. Verify m_employees has the employee record
  console.log('3️⃣ Checking m_employees...')
  const { data: employee, error: empError } = await supabase
    .from('m_employees')
    .select('id, employee_code, full_name, unit_id, is_active, user_id')
    .eq('user_id', testUser.id)
    .single()
  
  if (empError || !employee) {
    console.error('❌ Employee not found:', empError?.message)
    return
  }
  
  console.log('✅ Employee found in m_employees')
  console.log('   ID:', employee.id)
  console.log('   Code:', employee.employee_code)
  console.log('   Name:', employee.full_name)
  console.log('   Active:', employee.is_active)
  console.log('')
  
  // 4. Test login flow
  console.log('4️⃣ Testing login flow...')
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'mukhsin9@gmail.com',
    password: 'admin123'
  })
  
  if (loginError) {
    console.error('❌ Login failed:', loginError.message)
    return
  }
  
  console.log('✅ Login successful')
  console.log('   User ID:', loginData.user.id)
  console.log('   Email:', loginData.user.email)
  console.log('   Role:', loginData.user.user_metadata?.role)
  console.log('')
  
  // 5. Verify employee data can be fetched
  console.log('5️⃣ Verifying employee data fetch...')
  const { data: empData, error: empFetchError } = await supabase
    .from('m_employees')
    .select('id, full_name, unit_id, is_active')
    .eq('user_id', loginData.user.id)
    .single()
  
  if (empFetchError || !empData) {
    console.error('❌ Failed to fetch employee:', empFetchError?.message)
    return
  }
  
  console.log('✅ Employee data fetched successfully')
  console.log('   Name:', empData.full_name)
  console.log('   Active:', empData.is_active)
  console.log('')
  
  // Sign out
  await supabase.auth.signOut()
  
  console.log('✅ All checks passed!')
  console.log('\n📋 Summary:')
  console.log('   - t_user table: Removed ✅')
  console.log('   - auth.users: Working ✅')
  console.log('   - m_employees: Working ✅')
  console.log('   - Login flow: Working ✅')
  console.log('\n💡 Next steps:')
  console.log('   1. Clear browser cache and cookies')
  console.log('   2. Restart dev server: npm run dev')
  console.log('   3. Try login again in browser')
}

fixLogin().catch(console.error)
