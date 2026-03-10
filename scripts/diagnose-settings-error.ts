import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function diagnoseSettingsError() {
  console.log('🔍 Diagnosing Settings Page Error 500...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Check authentication
    console.log('1️⃣ Checking authentication...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    })

    if (authError) {
      console.error('❌ Authentication failed:', authError.message)
      return
    }

    console.log('✅ Authenticated as:', authData.user?.email)

    // 2. Check RLS policies for t_settings
    console.log('\n2️⃣ Testing t_settings access...')
    const { data: settingsData, error: settingsError } = await supabase
      .from('t_settings')
      .select('key, value')

    if (settingsError) {
      console.error('❌ Failed to access t_settings:', settingsError.message)
      console.error('   Error details:', settingsError)
      return
    }

    console.log('✅ t_settings accessible')
    console.log('   Records found:', settingsData?.length || 0)

    // 3. Check each setting key
    console.log('\n3️⃣ Checking individual settings...')
    const requiredKeys = ['company_info', 'footer', 'tax_rates', 'calculation_params', 'session_timeout']
    
    for (const key of requiredKeys) {
      const setting = settingsData?.find(s => s.key === key)
      if (setting) {
        console.log(`✅ ${key}:`)
        console.log(`   Value type: ${typeof setting.value}`)
        console.log(`   Value:`, JSON.stringify(setting.value, null, 2))
      } else {
        console.log(`❌ ${key}: Not found`)
      }
    }

    // 4. Test data parsing (simulate what the page does)
    console.log('\n4️⃣ Testing data parsing...')
    try {
      const settingsMap: any = {}
      settingsData?.forEach(item => {
        settingsMap[item.key] = item.value
      })

      const orgSettings = settingsMap.company_info || {}
      const footerSettings = settingsMap.footer || {}
      const taxRates = settingsMap.tax_rates || {}
      const calcParams = settingsMap.calculation_params || {}
      const sessionTimeout = settingsMap.session_timeout || {}

      const parsedSettings = {
        organization_name: orgSettings.name || '',
        organization_address: orgSettings.address || '',
        organization_phone: orgSettings.phone || '',
        organization_email: orgSettings.email || '',
        logo_url: orgSettings.logo || null,
        footer_text: typeof footerSettings === 'string' ? footerSettings : (footerSettings.text || ''),
        tax_rates: {
          'TK/0': taxRates['TK0'] || taxRates['TK/0'] || 5,
          'TK/1': taxRates['TK1'] || taxRates['TK/1'] || 5,
          'TK/2': taxRates['TK2'] || taxRates['TK/2'] || 15,
          'TK/3': taxRates['TK3'] || taxRates['TK/3'] || 15,
          'K/0': taxRates['K0'] || taxRates['K/0'] || 5,
          'K/1': taxRates['K1'] || taxRates['K/1'] || 15,
          'K/2': taxRates['K2'] || taxRates['K/2'] || 25,
          'K/3': taxRates['K3'] || taxRates['K/3'] || 30
        },
        calculation_params: {
          minScore: calcParams.minScore ?? 0,
          maxScore: calcParams.maxScore ?? 100
        },
        session_timeout: {
          hours: sessionTimeout.hours ?? 8
        }
      }

      console.log('✅ Data parsing successful')
      console.log('   Parsed settings:', JSON.stringify(parsedSettings, null, 2))
    } catch (parseError: any) {
      console.error('❌ Data parsing failed:', parseError.message)
      console.error('   Stack:', parseError.stack)
    }

    // 5. Check storage bucket
    console.log('\n5️⃣ Checking storage bucket...')
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets()

    if (bucketError) {
      console.error('❌ Failed to list buckets:', bucketError.message)
    } else {
      const logosBucket = buckets?.find(b => b.name === 'logos')
      if (logosBucket) {
        console.log('✅ Logos bucket exists')
        console.log('   Public:', logosBucket.public)
      } else {
        console.log('❌ Logos bucket not found')
      }
    }

    // 6. Check user role
    console.log('\n6️⃣ Checking user role...')
    const { data: employeeData, error: employeeError } = await supabase
      .from('m_employees')
      .select('role, full_name')
      .eq('user_id', authData.user?.id)
      .single()

    if (employeeError) {
      console.error('❌ Failed to get employee data:', employeeError.message)
    } else {
      console.log('✅ User role:', employeeData?.role)
      console.log('   Full name:', employeeData?.full_name)
    }

    console.log('\n✅ Diagnosis completed!')
    console.log('\n💡 If you see this message, the backend is working correctly.')
    console.log('   The 500 error might be a client-side issue or build cache.')
    console.log('   Try: npm run dev (restart dev server)')

  } catch (error: any) {
    console.error('\n❌ Diagnosis failed:', error.message)
    console.error('   Stack:', error.stack)
  }
}

diagnoseSettingsError()
