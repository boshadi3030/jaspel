import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testPoolPage() {
  console.log('Testing pool page data access...\n')

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Test 1: Check if t_pool table exists and is accessible
    console.log('1. Testing t_pool table access...')
    const { data: pools, error: poolError } = await supabase
      .from('t_pool')
      .select('*')
      .order('period', { ascending: false })
      .limit(5)

    if (poolError) {
      console.error('❌ Error accessing t_pool:', poolError.message)
    } else {
      console.log(`✓ Successfully accessed t_pool table`)
      console.log(`  Found ${pools?.length || 0} pools`)
      if (pools && pools.length > 0) {
        console.log(`  Latest pool: ${pools[0].period}`)
      }
    }

    // Test 2: Check pool table structure
    console.log('\n2. Checking pool table structure...')
    if (pools && pools.length > 0) {
      const samplePool = pools[0]
      const requiredFields = [
        'id', 'period', 'revenue_total', 'deduction_total',
        'net_pool', 'global_allocation_percentage', 'allocated_amount',
        'status', 'created_at'
      ]
      
      const missingFields = requiredFields.filter(field => !(field in samplePool))
      
      if (missingFields.length > 0) {
        console.error(`❌ Missing fields: ${missingFields.join(', ')}`)
      } else {
        console.log('✓ All required fields present')
      }
    }

    // Test 3: Check if settings table has required data
    console.log('\n3. Testing settings table...')
    const { data: settings, error: settingsError } = await supabase
      .from('t_settings')
      .select('key, value')

    if (settingsError) {
      console.error('❌ Error accessing t_settings:', settingsError.message)
    } else {
      console.log(`✓ Successfully accessed t_settings table`)
      console.log(`  Found ${settings?.length || 0} settings`)
      
      const settingKeys = settings?.map(s => s.key) || []
      const requiredSettings = ['organization_name', 'footer_text']
      const missingSettings = requiredSettings.filter(key => !settingKeys.includes(key))
      
      if (missingSettings.length > 0) {
        console.log(`  ⚠ Missing settings: ${missingSettings.join(', ')}`)
      }
    }

    console.log('\n✅ Pool page data access test completed!')
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

testPoolPage()
