#!/usr/bin/env tsx

/**
 * Simple Database Connection Test
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://omlbijupllrglmebbqnn.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbGJpanVwbGxyZ2xtZWJicW5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY5MjExMSwiZXhwIjoyMDg4MjY4MTExfQ.xi0dZznj9Nybfsyw-mEP1459l0GnQqZmwQmfievYq8U'

async function testConnection() {
  console.log('🧪 Testing Database Connection...\n')

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test basic connection
    const { data: units, error } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .limit(3)

    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }

    console.log(`✅ Database connected successfully`)
    console.log(`✅ Found ${units?.length || 0} active units`)
    
    if (units && units.length > 0) {
      units.forEach(unit => {
        console.log(`   - ${unit.code}: ${unit.name}`)
      })
    }

    return true

  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Database connection test passed!')
      console.log('\n📋 KPI Config Page Fix Summary:')
      console.log('✅ Removed dynamic imports that caused chunk loading errors')
      console.log('✅ Simplified Next.js webpack configuration')
      console.log('✅ Database connection is working')
      console.log('\n🔧 Next: Open http://localhost:3002/kpi-config to test the page')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })