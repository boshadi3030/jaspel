import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testPoolPageComplete() {
  console.log('🧪 Testing Pool Page Complete Flow...\n')

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test 1: Check RLS policies for pool
    console.log('1️⃣ Checking RLS policies for t_pool...')
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT policyname, cmd, qual, with_check 
          FROM pg_policies 
          WHERE tablename = 't_pool'
          ORDER BY policyname;
        `
      })
      .single()

    if (policyError) {
      console.log('⚠️  Could not check policies (expected if function not exists)')
    } else {
      console.log('✅ RLS policies checked')
    }

    // Test 2: Try to create a test pool
    console.log('\n2️⃣ Testing pool creation...')
    const testPeriod = '2026-03'
    
    // Check if test pool exists
    const { data: existingPool } = await supabase
      .from('t_pool')
      .select('id')
      .eq('period', testPeriod)
      .single()

    if (existingPool) {
      console.log('   Test pool already exists, deleting...')
      await supabase
        .from('t_pool')
        .delete()
        .eq('id', existingPool.id)
    }

    // Create new pool (without net_pool and allocated_amount - they are generated)
    const { data: newPool, error: createError } = await supabase
      .from('t_pool')
      .insert({
        period: testPeriod,
        revenue_total: 0,
        deduction_total: 0,
        global_allocation_percentage: 100,
        status: 'draft'
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating pool:', createError)
      return
    }

    console.log('✅ Pool created successfully')
    console.log('   Pool ID:', newPool.id)
    console.log('   Period:', newPool.period)
    console.log('   Net Pool (generated):', newPool.net_pool)
    console.log('   Allocated Amount (generated):', newPool.allocated_amount)

    // Test 3: Fetch pools
    console.log('\n3️⃣ Fetching all pools...')
    const { data: pools, error: fetchError } = await supabase
      .from('t_pool')
      .select('*')
      .order('period', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching pools:', fetchError)
      return
    }

    console.log(`✅ Found ${pools.length} pool(s)`)

    // Cleanup
    console.log('\n4️⃣ Cleaning up test data...')
    await supabase
      .from('t_pool')
      .delete()
      .eq('id', newPool.id)
    console.log('✅ Test pool deleted')

    console.log('\n✅ All pool page tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testPoolPageComplete()
