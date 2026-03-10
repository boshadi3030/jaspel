import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testPoolPage() {
  console.log('🧪 Testing Pool Page Data Access...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test 1: Fetch pools
    console.log('1️⃣ Fetching pools...')
    const { data: pools, error: poolError } = await supabase
      .from('t_pool')
      .select('*')
      .order('period', { ascending: false })

    if (poolError) {
      console.error('❌ Error fetching pools:', poolError)
      return
    }

    console.log(`✅ Found ${pools?.length || 0} pools`)
    if (pools && pools.length > 0) {
      console.log('   First pool:', pools[0])
    }

    // Test 2: Check table structure
    console.log('\n2️⃣ Checking t_pool table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('t_pool')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Error checking table:', tableError)
    } else {
      console.log('✅ Table accessible')
      if (tableInfo && tableInfo.length > 0) {
        console.log('   Columns:', Object.keys(tableInfo[0]))
      }
    }

    console.log('\n✅ Pool page data access test completed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testPoolPage()
