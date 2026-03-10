import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testPoolPage() {
  console.log('Testing pool page access...\n')
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data: testData, error: testError } = await supabase
      .from('t_pool')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError.message)
      return
    }
    console.log('✅ Supabase connection successful')
    
    // Test 2: Check pool table structure
    console.log('\n2. Checking pool table structure...')
    const { data: pools, error: poolError } = await supabase
      .from('t_pool')
      .select('*')
      .order('period', { ascending: false })
      .limit(5)
    
    if (poolError) {
      console.error('❌ Pool query failed:', poolError.message)
      return
    }
    console.log(`✅ Found ${pools?.length || 0} pools`)
    if (pools && pools.length > 0) {
      console.log('Sample pool:', JSON.stringify(pools[0], null, 2))
    }
    
    // Test 3: Check if the page route exists
    console.log('\n3. Testing page route...')
    const response = await fetch('http://localhost:3002/pool', {
      headers: {
        'Cookie': process.env.TEST_COOKIE || ''
      }
    })
    
    console.log(`Status: ${response.status} ${response.statusText}`)
    
    if (response.status === 500) {
      const text = await response.text()
      console.log('\n❌ 500 Error Response:')
      console.log(text.substring(0, 500))
    } else if (response.ok) {
      console.log('✅ Page loaded successfully')
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    console.error(error.stack)
  }
}

testPoolPage()
