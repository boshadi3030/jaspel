import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function debugSidebar() {
  console.log('🔍 Debugging Sidebar Issue...\n')

  try {
    // 1. Check if there are any users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    console.log(`✅ Found ${authUsers.users.length} auth users`)

    // 2. Check each user's metadata and employee data
    for (const user of authUsers.users) {
      console.log(`\n👤 User: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Role: ${user.user_metadata?.role || 'NOT SET'}`)
      
      // Check employee data
      const { data: employee, error: empError } = await supabase
        .from('m_employees')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (empError) {
        console.log(`   ⚠️  No employee record found`)
      } else {
        console.log(`   ✅ Employee: ${employee.full_name}`)
        console.log(`   Unit ID: ${employee.unit_id || 'NOT SET'}`)
        console.log(`   Active: ${employee.is_active}`)
      }
    }

    // 3. Check units
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('*')
      .eq('is_active', true)

    if (unitsError) {
      console.error('\n❌ Error fetching units:', unitsError)
    } else {
      console.log(`\n✅ Found ${units.length} active units`)
    }

    // 4. Check employees
    const { data: employees, error: employeesError } = await supabase
      .from('m_employees')
      .select('*')
      .eq('is_active', true)

    if (employeesError) {
      console.error('\n❌ Error fetching employees:', employeesError)
    } else {
      console.log(`✅ Found ${employees.length} active employees`)
    }

    console.log('\n✅ Debug complete!')
    console.log('\n📋 Recommendations:')
    console.log('1. Check browser console for JavaScript errors')
    console.log('2. Verify user has correct role in user_metadata')
    console.log('3. Ensure employee record exists with user_id')
    console.log('4. Check if sidebar component is rendering (React DevTools)')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugSidebar()
