#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function fixSubIndicatorsAccess() {
  console.log('🔧 Fixing Sub Indicators Access...')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Test 1: Check current data with service role
    console.log('\n📊 Testing with service role access...')
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select(`
        id,
        code,
        name,
        weight_percentage,
        indicator_id,
        is_active
      `)
      .eq('is_active', true)
    
    if (subError) {
      console.error('❌ Error with service role:', subError)
      return
    }
    
    console.log(`✅ Service role access successful: ${subIndicators?.length || 0} sub indicators`)
    
    // Test 2: Check if the issue is with the RLS policy
    console.log('\n🔐 Checking RLS policies...')
    
    // Get current policies for m_kpi_sub_indicators
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
          FROM pg_policies 
          WHERE tablename = 'm_kpi_sub_indicators'
          ORDER BY policyname;
        `
      })
    
    if (policyError) {
      console.log('⚠️ Could not fetch policies:', policyError)
    } else {
      console.log('📋 Current RLS policies for m_kpi_sub_indicators:')
      policies?.forEach((policy: any) => {
        console.log(`  • ${policy.policyname}: ${policy.cmd} for ${policy.roles}`)
        console.log(`    Condition: ${policy.qual}`)
      })
    }
    
    // Test 3: Test the actual query that the frontend uses
    console.log('\n🌐 Testing frontend query pattern...')
    
    // Simulate the query from KPI config page
    const { data: categories, error: catError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('is_active', true)
      .order('category')
    
    if (catError) {
      console.error('❌ Error fetching categories:', catError)
      return
    }
    
    console.log(`✅ Categories loaded: ${categories?.length || 0}`)
    
    if (categories && categories.length > 0) {
      const categoryIds = categories.map(c => c.id)
      
      const { data: indicators, error: indError } = await supabase
        .from('m_kpi_indicators')
        .select('*')
        .in('category_id', categoryIds)
        .order('code')
      
      if (indError) {
        console.error('❌ Error fetching indicators:', indError)
        return
      }
      
      console.log(`✅ Indicators loaded: ${indicators?.length || 0}`)
      
      if (indicators && indicators.length > 0) {
        const indicatorIds = indicators.map(i => i.id)
        
        const { data: subs, error: subsError } = await supabase
          .from('m_kpi_sub_indicators')
          .select('*')
          .in('indicator_id', indicatorIds)
          .order('code')
        
        if (subsError) {
          console.error('❌ Error fetching sub indicators:', subsError)
          console.log('This is the exact error the frontend is experiencing!')
        } else {
          console.log(`✅ Sub indicators loaded: ${subs?.length || 0}`)
          
          // Group by indicator
          const subsByIndicator = subs?.reduce((acc: any, sub) => {
            if (!acc[sub.indicator_id]) acc[sub.indicator_id] = []
            acc[sub.indicator_id].push(sub)
            return acc
          }, {}) || {}
          
          console.log('\n📊 Sub indicators by indicator:')
          indicators.forEach(indicator => {
            const indicatorSubs = subsByIndicator[indicator.id] || []
            console.log(`  📈 ${indicator.code}: ${indicator.name}`)
            console.log(`    📋 ${indicatorSubs.length} sub indicators`)
            indicatorSubs.forEach((sub: any) => {
              console.log(`      • ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
            })
          })
        }
      }
    }
    
    console.log('\n✅ Sub indicators access test completed!')
    
    if (subError || catError) {
      console.log('\n🔧 Recommended fixes:')
      console.log('   1. Check if RLS policies are correctly configured')
      console.log('   2. Verify that helper functions (is_superadmin, etc.) are working')
      console.log('   3. Test with different authentication methods')
    } else {
      console.log('\n✅ All tests passed! Sub indicators should be accessible.')
      console.log('   If they are not showing in the UI, check:')
      console.log('   1. Browser console for JavaScript errors')
      console.log('   2. Network tab for failed API calls')
      console.log('   3. Component state management')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

fixSubIndicatorsAccess()