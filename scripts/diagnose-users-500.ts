import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function diagnoseUsersError() {
  console.log('🔍 Mendiagnosis error 500 pada /users...\n')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  try {
    // Test 1: Check m_employees table
    console.log('1️⃣ Memeriksa tabel m_employees...')
    const { data: employees, error: empError } = await supabase
      .from('m_employees')
      .select('id, user_id, employee_code, full_name, unit_id, is_active')
      .not('user_id', 'is', null)
      .limit(5)
    
    if (empError) {
      console.error('❌ Error:', empError.message)
      return
    }
    console.log(`✅ Ditemukan ${employees?.length || 0} pegawai dengan user_id`)
    
    // Test 2: Check auth.users
    console.log('\n2️⃣ Memeriksa auth.users...')
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error:', authError.message)
      return
    }
    console.log(`✅ Ditemukan ${authData.users.length} auth users`)
    
    // Test 3: Check if employees have matching auth users
    console.log('\n3️⃣ Memeriksa kesesuaian data...')
    if (employees && employees.length > 0) {
      for (const emp of employees) {
        const authUser = authData.users.find(u => u.id === emp.user_id)
        if (authUser) {
          console.log(`✅ ${emp.full_name} - email: ${authUser.email}, role: ${authUser.user_metadata?.role}`)
        } else {
          console.log(`❌ ${emp.full_name} - user_id ${emp.user_id} tidak ditemukan di auth.users`)
        }
      }
    }
    
    console.log('\n✅ Diagnosis selesai')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

diagnoseUsersError()
