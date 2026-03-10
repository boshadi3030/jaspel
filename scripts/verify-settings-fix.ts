import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function verifySettingsFix() {
  console.log('✅ Verifying Settings Fix...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('1. Checking if t_settings table exists and has data...')
  try {
    const { data, error, count } = await supabase
      .from('t_settings')
      .select('*', { count: 'exact' })

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    console.log(`✅ Found ${count} settings in database`)
    
    if (data && data.length > 0) {
      console.log('\nSettings data:')
      data.forEach((item: any) => {
        console.log(`  - ${item.key}`)
      })
    } else {
      console.log('⚠️  No settings data found - need to insert default settings')
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }

  console.log('\n2. Testing direct Supabase access (like Sidebar/Footer)...')
  try {
    const { data: companyData, error: companyError } = await supabase
      .from('t_settings')
      .select('value')
      .eq('key', 'company_info')
      .maybeSingle()

    if (companyError) {
      console.error('❌ Company info error:', companyError.message)
    } else if (companyData) {
      console.log('✅ Company info loaded:', companyData.value?.name || 'N/A')
    } else {
      console.log('⚠️  No company info found')
    }

    const { data: footerData, error: footerError } = await supabase
      .from('t_settings')
      .select('value')
      .eq('key', 'footer')
      .maybeSingle()

    if (footerError) {
      console.error('❌ Footer error:', footerError.message)
    } else if (footerData) {
      console.log('✅ Footer loaded:', footerData.value?.text?.substring(0, 50) || 'N/A')
    } else {
      console.log('⚠️  No footer found')
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }

  console.log('\n✅ Verification complete!')
}

verifySettingsFix()
