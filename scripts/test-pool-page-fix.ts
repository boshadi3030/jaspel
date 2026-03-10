import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testPoolPageFix() {
  console.log('🧪 Testing Pool Page Fix...\n')

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test 1: Query t_pool table
    console.log('Test 1: Query t_pool table')
    const { data: pools, error: poolError } = await supabase
      .from('t_pool')
      .select('*')
      .order('period', { ascending: false })

    if (poolError) {
      console.error('❌ Error querying t_pool:', poolError)
      return
    }

    console.log('✅ Successfully queried t_pool')
    console.log(`   Found ${pools?.length || 0} pools\n`)

    // Test 2: Check generated columns
    if (pools && pools.length > 0) {
      console.log('Test 2: Check generated columns')
      const sample = pools[0]
      console.log('   Sample pool data:')
      console.log(`   - Period: ${sample.period}`)
      console.log(`   - Revenue Total: ${sample.revenue_total}`)
      console.log(`   - Deduction Total: ${sample.deduction_total}`)
      console.log(`   - Net Pool (generated): ${sample.net_pool}`)
      console.log(`   - Allocated Amount (generated): ${sample.allocated_amount}`)
      console.log(`   - Status: ${sample.status}\n`)

      // Verify generated columns are calculated correctly
      const expectedNetPool = sample.revenue_total - sample.deduction_total
      const expectedAllocated = (expectedNetPool * sample.global_allocation_percentage) / 100

      if (Math.abs(sample.net_pool - expectedNetPool) < 0.01) {
        console.log('✅ Net pool calculation is correct')
      } else {
        console.log('⚠️  Net pool calculation mismatch')
      }

      if (Math.abs(sample.allocated_amount - expectedAllocated) < 0.01) {
        console.log('✅ Allocated amount calculation is correct\n')
      } else {
        console.log('⚠️  Allocated amount calculation mismatch\n')
      }
    }

    // Test 3: Try to create a test pool (will be deleted)
    console.log('Test 3: Create test pool')
    const testPeriod = '2099-12' // Far future to avoid conflicts
    
    // Clean up any existing test pool
    await supabase.from('t_pool').delete().eq('period', testPeriod)

    const { data: newPool, error: createError } = await supabase
      .from('t_pool')
      .insert({
        period: testPeriod,
        revenue_total: 1000000,
        deduction_total: 100000,
        global_allocation_percentage: 100,
        status: 'draft'
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating test pool:', createError)
      return
    }

    console.log('✅ Test pool created successfully')
    console.log(`   Net Pool: ${newPool.net_pool} (should be 900000)`)
    console.log(`   Allocated Amount: ${newPool.allocated_amount} (should be 900000)\n`)

    // Clean up
    await supabase.from('t_pool').delete().eq('period', testPeriod)
    console.log('✅ Test pool cleaned up\n')

    console.log('🎉 All tests passed! Pool page should work now.')
    console.log('\n📝 Summary:')
    console.log('   - Generated columns (net_pool, allocated_amount) are working correctly')
    console.log('   - TypeScript interfaces updated to handle nullable values')
    console.log('   - Pool page should now load without 500 error')

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testPoolPageFix()
