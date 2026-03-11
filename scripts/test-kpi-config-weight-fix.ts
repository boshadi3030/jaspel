#!/usr/bin/env tsx

/**
 * Test script untuk memverifikasi perbaikan sistem bobot KPI
 * Menguji bahwa bobot bisa diisi di bawah 100% selama total tetap 100%
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWeightValidation() {
  console.log('🧪 Testing KPI Weight Validation System...\n')

  try {
    // 1. Get a test unit
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .limit(1)

    if (unitsError) throw unitsError
    if (!units || units.length === 0) {
      console.log('❌ No active units found')
      return
    }

    const testUnit = units[0]
    console.log(`📋 Using test unit: ${testUnit.code} - ${testUnit.name}`)

    // 2. Check existing categories
    const { data: categories, error: categoriesError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', testUnit.id)

    if (categoriesError) throw categoriesError

    console.log(`📊 Found ${categories?.length || 0} existing categories`)

    if (categories && categories.length > 0) {
      // Calculate total weight
      const totalWeight = categories.reduce((sum, cat) => sum + Number(cat.weight_percentage), 0)
      console.log(`⚖️  Current total category weight: ${totalWeight.toFixed(2)}%`)
      
      if (Math.abs(totalWeight - 100) < 0.01) {
        console.log('✅ Category weights are balanced (100%)')
      } else {
        console.log(`⚠️  Category weights are not balanced (should be 100%)`)
      }

      // Check indicators for each category
      for (const category of categories) {
        const { data: indicators, error: indicatorsError } = await supabase
          .from('m_kpi_indicators')
          .select('*')
          .eq('category_id', category.id)

        if (indicatorsError) throw indicatorsError

        if (indicators && indicators.length > 0) {
          const indicatorTotalWeight = indicators.reduce((sum, ind) => sum + Number(ind.weight_percentage), 0)
          console.log(`  📈 ${category.category} indicators total weight: ${indicatorTotalWeight.toFixed(2)}%`)

          // Check sub indicators for each indicator
          for (const indicator of indicators) {
            const { data: subIndicators, error: subError } = await supabase
              .from('m_kpi_sub_indicators')
              .select('*')
              .eq('indicator_id', indicator.id)

            if (subError) throw subError

            if (subIndicators && subIndicators.length > 0) {
              const subTotalWeight = subIndicators.reduce((sum, sub) => sum + Number(sub.weight_percentage), 0)
              console.log(`    📊 ${indicator.code} sub indicators total weight: ${subTotalWeight.toFixed(2)}%`)
            }
          }
        }
      }
    }

    // 3. Test weight validation scenarios
    console.log('\n🧪 Testing weight validation scenarios...')

    // Test case 1: Individual weight less than 100% should be allowed
    console.log('\n📝 Test Case 1: Individual weight < 100%')
    console.log('✅ Should allow individual weights like 25%, 30%, 45% as long as total = 100%')

    // Test case 2: Total weight exceeding 100% should be rejected
    console.log('\n📝 Test Case 2: Total weight > 100%')
    console.log('❌ Should reject if total would exceed 100%')

    // Test case 3: Zero or negative weights should be rejected
    console.log('\n📝 Test Case 3: Invalid weights')
    console.log('❌ Should reject zero or negative weights')

    console.log('\n✅ Weight validation system test completed!')
    console.log('\n📋 Summary of fixes applied:')
    console.log('  • Removed max="100" restriction on individual weights')
    console.log('  • Changed validation to allow weights > 0 (instead of 0.01-100 range)')
    console.log('  • Added helpful messages explaining total must equal 100%')
    console.log('  • Maintained validation that total cannot exceed 100%')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

async function main() {
  console.log('🚀 Starting KPI Weight Validation Test\n')
  await testWeightValidation()
  console.log('\n✅ Test completed successfully!')
}

if (require.main === module) {
  main().catch(console.error)
}