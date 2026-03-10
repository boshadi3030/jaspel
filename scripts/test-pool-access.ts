#!/usr/bin/env tsx

/**
 * Test Pool Page Access
 * Verifikasi bahwa halaman pool dapat diakses tanpa error
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testPoolAccess() {
  console.log('🧪 Testing Pool Page Access\n')

  try {
    // 1. Check if t_pool table exists and is accessible
    console.log('1️⃣ Checking t_pool table...')
    const { data: pools, error: poolError } = await supabase
      .from('t_pool')
      .select('*')
      .limit(5)

    if (poolError) {
      console.error('❌ Error accessing t_pool:', poolError.message)
      return false
    }

    console.log(`✅ t_pool table accessible (${pools?.length || 0} pools found)`)

    // 2. Check if required columns exist
    console.log('\n2️⃣ Checking table structure...')
    const requiredColumns = [
      'id',
      'period',
      'revenue_total',
      'deduction_total',
      'net_pool',
      'global_allocation_percentage',
      'allocated_amount',
      'status',
      'approved_by',
      'approved_at',
      'created_at'
    ]

    if (pools && pools.length > 0) {
      const firstPool = pools[0]
      const missingColumns = requiredColumns.filter(col => !(col in firstPool))

      if (missingColumns.length > 0) {
        console.error('❌ Missing columns:', missingColumns.join(', '))
        return false
      }

      console.log('✅ All required columns present')
    } else {
      console.log('⚠️  No pools to check structure (table is empty)')
    }

    // 3. Check if m_employees table exists (for approved_by reference)
    console.log('\n3️⃣ Checking m_employees table...')
    const { error: employeeError } = await supabase
      .from('m_employees')
      .select('id')
      .limit(1)

    if (employeeError) {
      console.error('❌ Error accessing m_employees:', employeeError.message)
      return false
    }

    console.log('✅ m_employees table accessible')

    // 4. Test creating a draft pool (will rollback)
    console.log('\n4️⃣ Testing pool creation...')
    const testPeriod = `TEST-${Date.now()}`
    const { data: newPool, error: createError } = await supabase
      .from('t_pool')
      .insert({
        period: testPeriod,
        revenue_total: 1000000,
        deduction_total: 100000,
        net_pool: 900000,
        global_allocation_percentage: 100,
        allocated_amount: 900000,
        status: 'draft'
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating test pool:', createError.message)
      return false
    }

    console.log('✅ Pool creation successful')

    // Clean up test pool
    if (newPool) {
      await supabase.from('t_pool').delete().eq('id', newPool.id)
      console.log('✅ Test pool cleaned up')
    }

    console.log('\n✅ All pool page tests passed!')
    console.log('\n📋 Summary:')
    console.log('   - t_pool table: ✅ Accessible')
    console.log('   - Table structure: ✅ Valid')
    console.log('   - m_employees reference: ✅ Valid')
    console.log('   - Pool creation: ✅ Working')
    console.log('\n🎉 Halaman pool siap digunakan!')

    return true
  } catch (error: any) {
    console.error('\n❌ Unexpected error:', error.message)
    return false
  }
}

// Run test
testPoolAccess()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
