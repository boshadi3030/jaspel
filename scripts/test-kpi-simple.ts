#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testKPISimple() {
  console.log('🔍 Testing KPI Sub Indicators - Simple Test...')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Test 1: Direct query with service role
    console.log('\n📊 Testing sub indicators with service role...')
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('id, code, name, weight_percentage, indicator_id')
      .eq('is_active', true)
    
    if (subError) {
      console.error('❌ Error:', subError)
      return
    }
    
    console.log('✅ Found', subIndicators?.length || 0, 'sub indicators')
    
    // Test 2: Test with user authentication
    console.log('\n👤 Testing with user authentication...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }
    
    console.log('✅ Authenticated successfully')
    
    // Test 3: Query with authenticated user
    console.log('\n🔐 Testing query with authenticated user...')
    const { data: authSubIndicators, error: authSubError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('id, code, name, weight_percentage')
      .eq('is_active', true)
    
    if (authSubError) {
      console.error('❌ Authenticated query error:', authSubError)
      console.log('This is the same error the frontend is experiencing!')
    } else {
      console.log('✅ Authenticated query successful:', authSubIndicators?.length || 0, 'sub indicators')
    }
    
    // Test 4: Check if it's a RLS policy issue
    console.log('\n🔧 Testing RLS bypass with service role...')
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const { data: serviceSubIndicators, error: serviceError } = await supabaseService
      .from('m_kpi_sub_indicators')
      .select('*')
      .eq('is_active', true)
    
    if (serviceError) {
      console.error('❌ Service role error:', serviceError)
    } else {
      console.log('✅ Service role query successful:', serviceSubIndicators?.length || 0, 'sub indicators')
      
      if (serviceSubIndicators && serviceSubIndicators.length > 0) {
        console.log('\n📋 Sub indicators found:')
        serviceSubIndicators.forEach(sub => {
          console.log('  •', sub.code + ':', sub.name, '(' + sub.weight_percentage + '%)')
        })
      }
    }
    
    console.log('\n✅ Simple test completed!')
    
    // Conclusion
    if (authSubError && !serviceError) {
      console.log('\n🎯 CONCLUSION: RLS policy is blocking authenticated users')
      console.log('💡 SOLUTION: Fix RLS policies for m_kpi_sub_indicators table')
    } else if (!authSubError) {
      console.log('\n🎯 CONCLUSION: Authentication and queries work fine')
      console.log('💡 CHECK: Frontend component state or rendering logic')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testKPISimple()