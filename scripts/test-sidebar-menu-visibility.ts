import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testSidebarMenuVisibility() {
  console.log('🔍 Testing Sidebar Menu Visibility Issues...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test 1: Check if we can authenticate
    console.log('1️⃣ Testing Authentication...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@jaspel.com',
      password: 'admin123',
    })

    if (authError || !authData.user) {
      console.error('❌ Authentication failed:', authError?.message)
      return
    }

    console.log('✅ Authentication successful')
    console.log('   User ID:', authData.user.id)
    console.log('   Role:', authData.user.user_metadata?.role)

    // Test 2: Check employee data
    console.log('\n2️⃣ Checking Employee Data...')
    const { data: employee, error: empError } = await supabase
      .from('m_employees')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    if (empError || !employee) {
      console.error('❌ Employee data not found:', empError?.message)
    } else {
      console.log('✅ Employee data found')
      console.log('   Name:', employee.full_name)
      console.log('   Unit ID:', employee.unit_id)
      console.log('   Active:', employee.is_active)
    }

    // Test 3: Check menu items for role
    console.log('\n3️⃣ Checking Menu Items for Role...')
    const role = authData.user.user_metadata?.role
    console.log('   Role:', role)

    // Simulate menu items logic
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
      { id: 'users', label: 'Manajemen Pengguna', path: '/admin/users', icon: 'Users' },
      { id: 'pegawai', label: 'Master Pegawai', path: '/admin/pegawai', icon: 'Users' },
      { id: 'units', label: 'Manajemen Unit', path: '/admin/units', icon: 'Building2' },
      { id: 'kpi', label: 'Konfigurasi KPI', path: '/admin/kpi-config', icon: 'Target' },
      { id: 'pool', label: 'Manajemen Pool', path: '/admin/pool', icon: 'Wallet' },
      { id: 'reports', label: 'Laporan', path: '/admin/reports', icon: 'BarChart3' },
      { id: 'notifications', label: 'Notifikasi', path: '/notifications', icon: 'Bell' },
      { id: 'settings', label: 'Pengaturan', path: '/admin/settings', icon: 'Settings' },
      { id: 'audit', label: 'Audit Trail', path: '/admin/audit', icon: 'Shield' },
      { id: 'profile', label: 'Profil', path: '/profile', icon: 'User' },
    ]

    console.log('   Expected menu items:', menuItems.length)
    menuItems.forEach(item => {
      console.log(`   - ${item.label} (${item.path})`)
    })

    // Test 4: Check if there are any CSS/styling issues
    console.log('\n4️⃣ Checking Potential Issues...')
    console.log('   ⚠️  Potential Issues to Check:')
    console.log('   1. LayoutWrapper margin (lg:ml-60) vs Sidebar width (w-72)')
    console.log('      - Sidebar width when expanded: 288px (w-72)')
    console.log('      - Main content margin: 240px (ml-60)')
    console.log('      - This mismatch could cause overlap!')
    console.log('   2. Z-index values:')
    console.log('      - Desktop Sidebar: z-1000')
    console.log('      - Mobile Button: z-1100')
    console.log('      - Mobile Sidebar: z-1050/1051')
    console.log('      - Logout Dialog: z-1200')
    console.log('   3. Menu items visibility depends on useAuth hook')
    console.log('   4. Logout function uses authService.logout()')

    // Test 5: Sign out
    console.log('\n5️⃣ Testing Logout...')
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error('❌ Logout failed:', signOutError.message)
    } else {
      console.log('✅ Logout successful')
    }

    console.log('\n📋 Summary:')
    console.log('   The sidebar component looks correct in code.')
    console.log('   Main issues to fix:')
    console.log('   1. LayoutWrapper margin mismatch with Sidebar width')
    console.log('   2. Need to verify menu items are rendering in browser')
    console.log('   3. Logout functionality should work but needs browser testing')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSidebarMenuVisibility()
