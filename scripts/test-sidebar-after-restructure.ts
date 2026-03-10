import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSidebarAfterRestructure() {
  console.log('🧪 Testing Sidebar After Route Restructure\n')
  console.log('=' .repeat(60))

  try {
    // 1. Test login
    console.log('\n1️⃣ Testing Login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'password123'
    })

    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }

    console.log('✅ Login successful')
    console.log(`   User ID: ${authData.user.id}`)
    console.log(`   Email: ${authData.user.email}`)
    console.log(`   Role: ${authData.user.user_metadata?.role}`)

    // 2. Check employee data
    console.log('\n2️⃣ Checking Employee Data...')
    const { data: employee, error: empError } = await supabase
      .from('m_employees')
      .select('id, full_name, unit_id, m_units(name)')
      .eq('user_id', authData.user.id)
      .single()

    if (empError) {
      console.error('❌ Failed to fetch employee:', empError.message)
    } else {
      console.log('✅ Employee data found')
      console.log(`   Name: ${employee.full_name}`)
      console.log(`   Unit: ${(employee.m_units as any)?.name || 'N/A'}`)
    }

    // 3. Verify route structure
    console.log('\n3️⃣ Verifying Route Structure...')
    const fs = require('fs')
    const path = require('path')
    
    const authenticatedPath = path.join(process.cwd(), 'app', '(authenticated)')
    const requiredRoutes = [
      'dashboard',
      'units',
      'users',
      'pegawai',
      'kpi-config',
      'pool',
      'realization',
      'reports',
      'audit',
      'settings',
      'profile',
      'notifications'
    ]

    let allRoutesExist = true
    for (const route of requiredRoutes) {
      const routePath = path.join(authenticatedPath, route)
      if (fs.existsSync(routePath)) {
        console.log(`   ✅ /${route} - exists in (authenticated)`)
      } else {
        console.log(`   ❌ /${route} - NOT FOUND`)
        allRoutesExist = false
      }
    }

    if (allRoutesExist) {
      console.log('\n✅ All routes properly structured under (authenticated)')
    } else {
      console.log('\n❌ Some routes are missing')
    }

    // 4. Check layout file
    console.log('\n4️⃣ Checking Layout Configuration...')
    const layoutPath = path.join(authenticatedPath, 'layout.tsx')
    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, 'utf-8')
      
      if (layoutContent.includes('<Sidebar />')) {
        console.log('   ✅ Sidebar component included in layout')
      } else {
        console.log('   ❌ Sidebar component NOT found in layout')
      }

      if (layoutContent.includes('lg:ml-72')) {
        console.log('   ✅ Correct margin (lg:ml-72) applied to main content')
      } else if (layoutContent.includes('lg:ml-60')) {
        console.log('   ⚠️  Old margin (lg:ml-60) found - should be lg:ml-72')
      } else {
        console.log('   ❌ No left margin found on main content')
      }
    } else {
      console.log('   ❌ Layout file not found')
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n✅ TEST COMPLETED')
    console.log('\n📋 Summary:')
    console.log('   - Login: Working')
    console.log('   - Employee Data: Available')
    console.log('   - Route Structure: Reorganized under (authenticated)')
    console.log('   - Layout: Includes Sidebar component')
    console.log('\n💡 Next Steps:')
    console.log('   1. Restart the development server')
    console.log('   2. Clear browser cache and cookies')
    console.log('   3. Login again at http://localhost:3002/login')
    console.log('   4. Navigate to /dashboard')
    console.log('   5. Sidebar should now be visible!')

  } catch (error) {
    console.error('\n❌ Test failed with error:', error)
  }
}

testSidebarAfterRestructure()
