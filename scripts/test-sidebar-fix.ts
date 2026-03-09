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

async function testSidebarFix() {
  console.log('🧪 Testing Sidebar Fix...\n')

  try {
    // 1. Check if superadmin user exists
    console.log('1️⃣ Checking superadmin user...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message)
      return
    }

    const superadmin = authUsers.users.find(u => u.user_metadata?.role === 'superadmin')
    
    if (!superadmin) {
      console.log('❌ Superadmin user not found')
      console.log('   Run: npx tsx scripts/setup-auth.ts')
      return
    }

    console.log('✅ Superadmin found:', superadmin.email)
    console.log('   Role:', superadmin.user_metadata?.role)

    // 2. Check employee data
    console.log('\n2️⃣ Checking employee data...')
    const { data: employee, error: empError } = await supabase
      .from('m_employees')
      .select('id, employee_code, full_name, unit_id, is_active')
      .eq('user_id', superadmin.id)
      .single()

    if (empError || !employee) {
      console.log('❌ Employee data not found:', empError?.message)
      return
    }

    console.log('✅ Employee data found:')
    console.log('   Name:', employee.full_name)
    console.log('   Code:', employee.employee_code)
    console.log('   Active:', employee.is_active)

    // 3. Check unit data if exists
    if (employee.unit_id) {
      console.log('\n3️⃣ Checking unit data...')
      const { data: unit, error: unitError } = await supabase
        .from('m_units')
        .select('id, name, is_active')
        .eq('id', employee.unit_id)
        .single()

      if (unit) {
        console.log('✅ Unit data found:')
        console.log('   Name:', unit.name)
        console.log('   Active:', unit.is_active)
      } else {
        console.log('⚠️  Unit not found:', unitError?.message)
      }
    }

    // 4. Test menu items for superadmin
    console.log('\n4️⃣ Expected menu items for superadmin:')
    const expectedMenus = [
      '📊 Dashboard (/admin/dashboard)',
      '👥 Manajemen Pengguna (/admin/users)',
      '👥 Master Pegawai (/admin/pegawai)',
      '🏢 Manajemen Unit (/admin/units)',
      '🎯 Konfigurasi KPI (/admin/kpi-config)',
      '💰 Manajemen Pool (/admin/pool)',
      '📈 Laporan (/admin/reports)',
      '🔔 Notifikasi (/notifications)',
      '⚙️  Pengaturan (/admin/settings)',
      '🛡️  Audit Trail (/admin/audit)',
      '👤 Profil (/profile)',
    ]

    expectedMenus.forEach(menu => console.log('   ✓', menu))

    // 5. Instructions
    console.log('\n📋 Next Steps:')
    console.log('   1. Start dev server: npm run dev')
    console.log('   2. Open: http://localhost:3002/login')
    console.log(`   3. Login with: ${superadmin.email} / [your password]`)
    console.log('   4. Check if sidebar appears with all menu items')
    console.log('   5. Open browser console (F12) to check for errors')
    console.log('\n💡 Available superadmin accounts:')
    authUsers.users
      .filter(u => u.user_metadata?.role === 'superadmin')
      .forEach(u => console.log(`   - ${u.email}`))

    console.log('\n✅ Sidebar fix test completed!')

  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testSidebarFix()
