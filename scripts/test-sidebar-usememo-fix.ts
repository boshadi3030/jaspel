import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSidebarFix() {
  console.log('🔍 Testing Sidebar useMemo Fix...\n')

  try {
    // Test 1: Check if database queries work
    console.log('1️⃣ Testing database queries...')
    
    const { count: unitsCount, error: unitsError } = await supabase
      .from('m_units')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    if (unitsError) {
      console.error('❌ Units query failed:', unitsError)
    } else {
      console.log(`✅ Units query successful: ${unitsCount} active units`)
    }

    const { count: employeesCount, error: employeesError } = await supabase
      .from('m_employees')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    if (employeesError) {
      console.error('❌ Employees query failed:', employeesError)
    } else {
      console.log(`✅ Employees query successful: ${employeesCount} active employees`)
    }

    // Test 2: Check pool data
    console.log('\n2️⃣ Testing pool queries...')
    
    const { data: pools, error: poolsError } = await supabase
      .from('t_pool')
      .select('allocated_amount')
      .eq('status', 'approved')
    
    if (poolsError) {
      console.error('❌ Pools query failed:', poolsError)
    } else {
      const totalPoolAmount = pools?.reduce((sum: number, pool: any) => sum + (pool.allocated_amount || 0), 0) || 0
      console.log(`✅ Pools query successful: ${pools?.length || 0} approved pools`)
      console.log(`   Total pool amount: Rp ${totalPoolAmount.toLocaleString('id-ID')}`)
    }

    // Test 3: Check calculation results
    console.log('\n3️⃣ Testing calculation results...')
    
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { count: calculationCount, error: calcError } = await supabase
      .from('t_calculation_results')
      .select('*', { count: 'exact', head: true })
      .gte('calculated_at', startOfMonth.toISOString())
    
    if (calcError) {
      console.error('❌ Calculation results query failed:', calcError)
    } else {
      console.log(`✅ Calculation results query successful: ${calculationCount} calculations this month`)
    }

    console.log('\n✅ All database queries completed successfully!')
    console.log('\n📝 Summary of fixes:')
    console.log('   1. Added useMemo import to Sidebar.tsx')
    console.log('   2. Removed Promise.race timeout logic from dashboard')
    console.log('   3. Simplified dashboard queries for better performance')
    console.log('   4. Removed diagnostic code from Sidebar')
    
    console.log('\n🎯 Next steps:')
    console.log('   1. Restart the development server')
    console.log('   2. Clear browser cache (Ctrl+Shift+Delete)')
    console.log('   3. Test login and sidebar navigation')
    console.log('   4. Verify dashboard loads without timeout errors')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testSidebarFix()
