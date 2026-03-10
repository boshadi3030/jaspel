import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function diagnosePoolError() {
  console.log('🔍 Diagnosing Pool Page Error...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test 1: Check if we can fetch pool data
  console.log('Test 1: Fetching pool data...')
  try {
    const { data, error } = await supabase
      .from('t_pool')
      .select('*')
      .order('period', { ascending: false })

    if (error) {
      console.error('❌ Error fetching pools:', error)
    } else {
      console.log('✅ Successfully fetched pools:', data?.length || 0, 'records')
    }
  } catch (err) {
    console.error('❌ Exception:', err)
  }

  // Test 2: Check table structure
  console.log('\nTest 2: Checking t_pool table structure...')
  try {
    const { data, error } = await supabase
      .from('t_pool')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error:', error)
    } else {
      console.log('✅ Table structure:', data?.[0] ? Object.keys(data[0]) : 'No data')
    }
  } catch (err) {
    console.error('❌ Exception:', err)
  }

  // Test 3: Check RLS policies
  console.log('\nTest 3: Testing RLS policies...')
  try {
    // Try without auth
    const { data: publicData, error: publicError } = await supabase
      .from('t_pool')
      .select('id')
      .limit(1)

    if (publicError) {
      console.log('⚠️  Public access blocked (expected):', publicError.message)
    } else {
      console.log('✅ Public access allowed:', publicData?.length || 0, 'records')
    }
  } catch (err) {
    console.error('❌ Exception:', err)
  }

  console.log('\n✅ Diagnosis complete!')
}

diagnosePoolError().catch(console.error)
