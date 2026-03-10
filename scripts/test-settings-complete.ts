import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testSettingsComplete() {
  console.log('🧪 Testing Complete Settings Page...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Test loading all settings
    console.log('1️⃣ Testing load all settings...')
    const { data: settingsData, error: loadError } = await supabase
      .from('t_settings')
      .select('key, value')

    if (loadError) {
      console.error('❌ Failed to load settings:', loadError.message)
      return
    }

    console.log('✅ Settings loaded successfully')
    console.log('   Keys found:', settingsData?.map(s => s.key).join(', '))

    // 2. Check each required setting
    const requiredKeys = ['company_info', 'footer', 'tax_rates', 'calculation_params', 'session_timeout']
    const settingsMap: Record<string, any> = {}
    
    settingsData?.forEach(item => {
      settingsMap[item.key] = item.value
    })

    console.log('\n2️⃣ Checking required settings...')
    for (const key of requiredKeys) {
      if (settingsMap[key]) {
        console.log(`✅ ${key}: Found`)
        console.log(`   Value:`, JSON.stringify(settingsMap[key], null, 2))
      } else {
        console.log(`❌ ${key}: Missing`)
      }
    }

    // 3. Test storage bucket access
    console.log('\n3️⃣ Testing storage bucket access...')
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets()

    if (bucketError) {
      console.error('❌ Failed to list buckets:', bucketError.message)
    } else {
      const logosBucket = buckets?.find(b => b.name === 'logos')
      if (logosBucket) {
        console.log('✅ Logos bucket found')
        console.log('   Public:', logosBucket.public)
        console.log('   File size limit:', logosBucket.file_size_limit, 'bytes')
      } else {
        console.log('❌ Logos bucket not found')
      }
    }

    // 4. Test storage policies
    console.log('\n4️⃣ Testing storage policies...')
    const testFile = new Blob(['test'], { type: 'image/png' })
    const testFileName = `test-${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(testFileName, testFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message)
      console.log('   This might be due to authentication. Try after login.')
    } else {
      console.log('✅ Upload test successful')
      
      // Clean up test file
      await supabase.storage.from('logos').remove([testFileName])
      console.log('   Test file cleaned up')
    }

    // 5. Validate tax rates structure
    console.log('\n5️⃣ Validating tax rates structure...')
    const taxRates = settingsMap['tax_rates']
    if (taxRates) {
      const expectedKeys = ['TK0', 'K0', 'K1', 'K2', 'K3']
      const hasAllKeys = expectedKeys.every(key => key in taxRates)
      
      if (hasAllKeys) {
        console.log('✅ Tax rates structure is valid')
        for (const key of expectedKeys) {
          console.log(`   ${key}: ${taxRates[key]}%`)
        }
      } else {
        console.log('❌ Tax rates structure is incomplete')
        console.log('   Expected keys:', expectedKeys.join(', '))
        console.log('   Found keys:', Object.keys(taxRates).join(', '))
      }
    }

    // 6. Validate calculation params
    console.log('\n6️⃣ Validating calculation parameters...')
    const calcParams = settingsMap['calculation_params']
    if (calcParams) {
      if (calcParams.minScore !== undefined && calcParams.maxScore !== undefined) {
        console.log('✅ Calculation parameters are valid')
        console.log(`   Min Score: ${calcParams.minScore}`)
        console.log(`   Max Score: ${calcParams.maxScore}`)
        
        if (calcParams.minScore >= calcParams.maxScore) {
          console.log('⚠️  Warning: minScore should be less than maxScore')
        }
      } else {
        console.log('❌ Calculation parameters are incomplete')
      }
    }

    // 7. Validate session timeout
    console.log('\n7️⃣ Validating session timeout...')
    const sessionTimeout = settingsMap['session_timeout']
    if (sessionTimeout && sessionTimeout.hours) {
      console.log('✅ Session timeout is valid')
      console.log(`   Timeout: ${sessionTimeout.hours} hours`)
      
      if (sessionTimeout.hours < 1 || sessionTimeout.hours > 24) {
        console.log('⚠️  Warning: Session timeout should be between 1-24 hours')
      }
    } else {
      console.log('❌ Session timeout is invalid')
    }

    console.log('\n✅ Settings page test completed!')

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
  }
}

testSettingsComplete()
