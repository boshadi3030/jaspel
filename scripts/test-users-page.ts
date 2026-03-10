import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testUsersPage() {
  console.log('🧪 Testing Users Page Data Fetching...\n')
  
  try {
    // Test 1: Get employees with user_id
    console.log('1️⃣ Fetching employees with user_id...')
    const { data: employees, error: empError, count } = await supabase
      .from('m_employees')
      .select(`
        id,
        employee_code,
        full_name,
        unit_id,
        tax_status,
        is_active,
        user_id,
        created_at,
        updated_at,
        m_units(id, name)
      `, { count: 'exact' })
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false })
      .range(0, 49)
    
    if (empError) {
      console.error('❌ Error fetching employees:', empError)
      return
    }
    
    console.log(`✅ Found ${count} employees with user accounts`)
    console.log(`   Retrieved ${employees?.length || 0} employees in first page\n`)
    
    // Test 2: Get auth users
    console.log('2️⃣ Fetching auth users...')
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }
    
    console.log(`✅ Found ${authData.users.length} auth users\n`)
    
    // Test 3: Match employees with auth users
    console.log('3️⃣ Matching employees with auth users...')
    let matchCount = 0
    let unmatchedEmployees: string[] = []
    
    employees?.forEach(emp => {
      const authUser = authData.users.find(u => u.id === emp.user_id)
      if (authUser) {
        matchCount++
        console.log(`   ✓ ${emp.full_name} (${emp.employee_code}) → ${authUser.email} [${authUser.user_metadata?.role || 'no role'}]`)
      } else {
        unmatchedEmployees.push(`${emp.full_name} (${emp.employee_code})`)
      }
    })
    
    console.log(`\n✅ Matched ${matchCount}/${employees?.length || 0} employees with auth users`)
    
    if (unmatchedEmployees.length > 0) {
      console.log(`\n⚠️  Unmatched employees:`)
      unmatchedEmployees.forEach(name => console.log(`   - ${name}`))
    }
    
    // Test 4: Sample transformed data
    if (employees && employees.length > 0) {
      console.log('\n4️⃣ Sample transformed data:')
      const sample = employees[0]
      const authUser = authData.users.find(u => u.id === sample.user_id)
      const unit = Array.isArray(sample.m_units) ? sample.m_units[0] : sample.m_units
      
      const transformed = {
        id: sample.user_id,
        email: authUser?.email || '',
        role: authUser?.user_metadata?.role || 'employee',
        employee_id: sample.id,
        is_active: sample.is_active,
        pegawai: {
          id: sample.id,
          employee_code: sample.employee_code,
          full_name: sample.full_name,
          unit_id: sample.unit_id,
          tax_status: sample.tax_status,
          is_active: sample.is_active
        },
        unit: unit || null
      }
      
      console.log(JSON.stringify(transformed, null, 2))
    }
    
    console.log('\n✅ All tests passed! Users page should work correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testUsersPage()
