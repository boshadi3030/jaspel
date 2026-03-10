import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function diagnoseSettingsAPI() {
  console.log('🔍 Diagnosing Settings API...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('1. Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('t_settings')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Database connection failed:', testError.message)
      return
    }
    console.log('✅ Database connection OK\n')

    console.log('2. Fetching settings data...')
    const { data, error } = await supabase
      .from('t_settings')
      .select('key, value')

    if (error) {
      console.error('❌ Error fetching settings:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return
    }

    console.log('✅ Settings fetched successfully')
    console.log(`Found ${data?.length || 0} settings:\n`)

    if (data && data.length > 0) {
      data.forEach((item: any) => {
        console.log(`  - ${item.key}:`, typeof item.value === 'object' ? JSON.stringify(item.value).substring(0, 100) + '...' : item.value)
      })
    } else {
      console.log('⚠️  No settings found in database')
    }

    console.log('\n3. Testing transformation...')
    const settings: any = {}
    data?.forEach((item: any) => {
      settings[item.key] = item.value
    })
    console.log('✅ Transformation successful')
    console.log('Settings object keys:', Object.keys(settings))

    console.log('\n4. Testing API endpoint...')
    try {
      const response = await fetch('http://localhost:3002/api/settings')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const apiData = await response.json()
        console.log('✅ API response OK')
        console.log('API data keys:', Object.keys(apiData))
      } else {
        const errorText = await response.text()
        console.error('❌ API error:', errorText)
      }
    } catch (fetchError: any) {
      console.error('❌ Fetch error:', fetchError.message)
      console.log('Note: Make sure dev server is running on port 3002')
    }

  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
    console.error('Stack:', error.stack)
  }
}

diagnoseSettingsAPI()
