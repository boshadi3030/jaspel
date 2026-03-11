#!/usr/bin/env tsx

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testKPIExportAPI() {
  console.log('🧪 Testing KPI Export API...\n')

  try {
    // 1. Get a unit for testing
    console.log('1. Getting test unit...')
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .limit(1)

    if (unitsError || !units || units.length === 0) {
      console.error('❌ No units found for testing')
      return
    }

    const testUnit = units[0]
    console.log(`✅ Using unit: ${testUnit.code} - ${testUnit.name}`)

    // 2. Test Excel export API
    console.log('\n2. Testing Excel export API...')
    const excelUrl = `http://localhost:3002/api/kpi-config/export?unitId=${testUnit.id}&format=excel`
    
    try {
      const excelResponse = await fetch(excelUrl)
      if (excelResponse.ok) {
        const contentType = excelResponse.headers.get('content-type')
        console.log('✅ Excel export API working')
        console.log(`   Content-Type: ${contentType}`)
        console.log(`   Status: ${excelResponse.status}`)
      } else {
        console.error(`❌ Excel export failed: ${excelResponse.status}`)
        const errorText = await excelResponse.text()
        console.error(`   Error: ${errorText}`)
      }
    } catch (error) {
      console.error('❌ Excel export request failed:', error)
    }

    // 3. Test PDF export API
    console.log('\n3. Testing PDF export API...')
    const pdfUrl = `http://localhost:3002/api/kpi-config/export?unitId=${testUnit.id}&format=pdf`
    
    try {
      const pdfResponse = await fetch(pdfUrl)
      if (pdfResponse.ok) {
        const contentType = pdfResponse.headers.get('content-type')
        console.log('✅ PDF export API working')
        console.log(`   Content-Type: ${contentType}`)
        console.log(`   Status: ${pdfResponse.status}`)
      } else {
        console.error(`❌ PDF export failed: ${pdfResponse.status}`)
        const errorText = await pdfResponse.text()
        console.error(`   Error: ${errorText}`)
      }
    } catch (error) {
      console.error('❌ PDF export request failed:', error)
    }

    // 4. Test Guide PDF API
    console.log('\n4. Testing Guide PDF API...')
    const guideUrl = `http://localhost:3002/api/kpi-config/guide`
    
    try {
      const guideResponse = await fetch(guideUrl)
      if (guideResponse.ok) {
        const contentType = guideResponse.headers.get('content-type')
        console.log('✅ Guide PDF API working')
        console.log(`   Content-Type: ${contentType}`)
        console.log(`   Status: ${guideResponse.status}`)
      } else {
        console.error(`❌ Guide PDF failed: ${guideResponse.status}`)
        const errorText = await guideResponse.text()
        console.error(`   Error: ${errorText}`)
      }
    } catch (error) {
      console.error('❌ Guide PDF request failed:', error)
    }

    console.log('\n🎉 KPI Export API testing completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testKPIExportAPI()