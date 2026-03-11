#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSubIndicators() {
  console.log('🔍 Testing Sub Indicators Fix...')
  
  try {
    // Test 1: Check if sub indicators table exists and has data
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .limit(5)
    
    if (subError) {
      console.error('❌ Error fetching sub indicators:', subError)
      return
    }
    
    console.log(`✅ Found ${subIndicators?.length || 0} sub indicators`)
    if (subIndicators && subIndicators.length > 0) {
      console.log('📋 Sample sub indicator:', {
        id: subIndicators[0].id,
        code: subIndicators[0].code,
        name: subIndicators[0].name,
        indicator_id: subIndicators[0].indicator_id
      })
    }
    
    // Test 2: Check RLS policies
    console.log('\n🔐 Testing RLS policies...')
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'm_kpi_sub_indicators' })
      .single()
    
    if (policyError) {
      console.log('⚠️ Could not fetch policies (this is normal)')
    }
    
    // Test 3: Test with superadmin context
    console.log('\n👤 Testing with superadmin context...')
    
    // Get superadmin user
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) {
      console.error('❌ Error fetching users:', userError)
      return
    }
    
    const superadmin = users.users.find(u => 
      u.user_metadata?.role === 'superadmin' || 
      u.raw_user_meta_data?.role === 'superadmin'
    )
    
    if (!superadmin) {
      console.log('⚠️ No superadmin found')
      return
    }
    
    console.log(`✅ Found superadmin: ${superadmin.email}`)
    
    // Test 4: Check indicators and their sub indicators
    console.log('\n📊 Testing KPI structure...')
    const { data: indicators, error: indError } = await supabase
      .from('m_kpi_indicators')
      .select(`
        id,
        code,
        name,
        m_kpi_sub_indicators (
          id,
          code,
          name,
          weight_percentage
        )
      `)
    
    if (indError) {
      console.error('❌ Error fetching indicators with sub indicators:', indError)
      return
    }
    
    console.log(`✅ Found ${indicators?.length || 0} indicators`)
    indicators?.forEach(indicator => {
      const subCount = indicator.m_kpi_sub_indicators?.length || 0
      console.log(`  📈 ${indicator.code}: ${indicator.name} (${subCount} sub indicators)`)
      
      if (subCount > 0) {
        indicator.m_kpi_sub_indicators?.forEach((sub: any) => {
          console.log(`    📋 ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
        })
      }
    })
    
    console.log('\n✅ Sub indicators test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSubIndicators()