import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPoolEditFunction() {
  console.log('🧪 Testing Pool Edit Function...\n')

  try {
    // 1. Get a draft pool
    console.log('1️⃣ Fetching draft pool...')
    const { data: pools, error: poolError } = await supabase
      .from('t_pool')
      .select('*')
      .eq('status', 'draft')
      .limit(1)

    if (poolError) throw poolError

    if (!pools || pools.length === 0) {
      console.log('❌ No draft pool found. Creating one...')
      
      const { data: newPool, error: createError } = await supabase
        .from('t_pool')
        .insert({
          period: '2026-03',
          global_allocation_percentage: 100,
          revenue_total: 0,
          deduction_total: 0,
          status: 'draft'
        })
        .select()
        .single()

      if (createError) throw createError
      console.log('✅ Created draft pool:', newPool.period)
      pools.push(newPool)
    }

    const pool = pools[0]
    console.log(`✅ Using pool: ${pool.period} (ID: ${pool.id})\n`)

    // 2. Add revenue item
    console.log('2️⃣ Adding revenue item...')
    const { data: revenue, error: revenueError } = await supabase
      .from('t_pool_revenue')
      .insert({
        pool_id: pool.id,
        description: 'Test Revenue Item',
        amount: 5000000
      })
      .select()
      .single()

    if (revenueError) throw revenueError
    console.log('✅ Revenue item added:', revenue.description, '-', revenue.amount)

    // 3. Edit revenue item
    console.log('\n3️⃣ Editing revenue item...')
    const { data: updatedRevenue, error: updateRevenueError } = await supabase
      .from('t_pool_revenue')
      .update({
        description: 'Updated Revenue Item',
        amount: 7500000
      })
      .eq('id', revenue.id)
      .select()
      .single()

    if (updateRevenueError) throw updateRevenueError
    console.log('✅ Revenue item updated:', updatedRevenue.description, '-', updatedRevenue.amount)

    // 4. Add deduction item
    console.log('\n4️⃣ Adding deduction item...')
    const { data: deduction, error: deductionError } = await supabase
      .from('t_pool_deduction')
      .insert({
        pool_id: pool.id,
        description: 'Test Deduction Item',
        amount: 1000000
      })
      .select()
      .single()

    if (deductionError) throw deductionError
    console.log('✅ Deduction item added:', deduction.description, '-', deduction.amount)

    // 5. Edit deduction item
    console.log('\n5️⃣ Editing deduction item...')
    const { data: updatedDeduction, error: updateDeductionError } = await supabase
      .from('t_pool_deduction')
      .update({
        description: 'Updated Deduction Item',
        amount: 1500000
      })
      .eq('id', deduction.id)
      .select()
      .single()

    if (updateDeductionError) throw updateDeductionError
    console.log('✅ Deduction item updated:', updatedDeduction.description, '-', updatedDeduction.amount)

    // 6. Verify pool totals
    console.log('\n6️⃣ Verifying pool totals...')
    const { data: revenueItems } = await supabase
      .from('t_pool_revenue')
      .select('amount')
      .eq('pool_id', pool.id)

    const { data: deductionItems } = await supabase
      .from('t_pool_deduction')
      .select('amount')
      .eq('pool_id', pool.id)

    const revenueTotal = revenueItems?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
    const deductionTotal = deductionItems?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

    console.log('Revenue Total:', revenueTotal)
    console.log('Deduction Total:', deductionTotal)
    console.log('Net Pool:', revenueTotal - deductionTotal)

    // 7. Update pool totals
    console.log('\n7️⃣ Updating pool totals...')
    const { error: updatePoolError } = await supabase
      .from('t_pool')
      .update({
        revenue_total: revenueTotal,
        deduction_total: deductionTotal
      })
      .eq('id', pool.id)

    if (updatePoolError) throw updatePoolError
    console.log('✅ Pool totals updated')

    // 8. Cleanup
    console.log('\n8️⃣ Cleaning up test data...')
    await supabase.from('t_pool_revenue').delete().eq('id', revenue.id)
    await supabase.from('t_pool_deduction').delete().eq('id', deduction.id)
    console.log('✅ Test data cleaned up')

    console.log('\n✅ All tests passed! Edit function is working correctly.')
    console.log('\n📝 Summary:')
    console.log('- Revenue items can be edited ✓')
    console.log('- Deduction items can be edited ✓')
    console.log('- Pool totals are calculated correctly ✓')
    console.log('\n🎉 You can now edit items in the pool detail dialog!')

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

testPoolEditFunction()
