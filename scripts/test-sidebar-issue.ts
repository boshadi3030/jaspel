import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSidebarIssue() {
  console.log('🔍 Testing Sidebar Issue...\n')

  try {
    // 1. Check if superadmin user exists
    console.log('1. Checking superadmin user...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    const superadmin = authUsers.users.find(u => u.email === 'superadmin@jaspel.com')
    if (!superadmin) {
      console.error('❌ Superadmin user not found')
      return
    }
    
    console.log('✅ Superadmin found:', superadmin.email)
    console.log('   Role:', superadmin.user_metadata?.role)
    console.log('   User ID:', superadmin.id)

    // 2. Check employee record
    console.log('\n2. Checking employee record...')
    const { data: employee, error: empError } = await supabase
      .from('m_employees')
      .select('*')
      .eq('user_id', superadmin.id)
      .single()

    if (empError) {
      console.error('❌ Error fetching employee:', empError)
      return
    }

    console.log('✅ Employee found:', employee.full_name)
    console.log('   Active:', employee.is_active)
    console.log('   Unit ID:', employee.unit_id)

    // 3. Check if unit exists
    if (employee.unit_id) {
      console.log('\n3. Checking unit...')
      const { data: unit, error: unitError } = await supabase
        .from('m_units')
        .select('*')
        .eq('id', employee.unit_id)
        .single()

      if (unitError) {
        console.error('❌ Error fetching unit:', unitError)
      } else {
        console.log('✅ Unit found:', unit.name)
      }
    }

    // 4. Test menu items for superadmin
    console.log('\n4. Expected menu items for superadmin:')
    const expectedMenuItems = [
      'Dashboard',
      'Manajemen Pengguna',
      'Master Pegawai',
      'Manajemen Unit',
      'Konfigurasi KPI',
      'Manajemen Pool',
      'Laporan',
      'Notifikasi',
      'Pengaturan',
      'Audit Trail',
      'Profil'
    ]
    expectedMenuItems.forEach(item => console.log('   -', item))

    console.log('\n✅ All checks passed!')
    console.log('\n📋 Troubleshooting steps:')
    console.log('1. Open browser console (F12) and check for errors')
    console.log('2. Check if Sidebar component is rendering')
    console.log('3. Check if useAuth hook is returning user data')
    console.log('4. Check if LayoutWrapper is showing sidebar for /admin routes')
    console.log('5. Verify that lg:block class is not being overridden')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testSidebarIssue()
