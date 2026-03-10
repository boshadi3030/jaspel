import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function verifySettings() {
  console.log('🔍 Verifying Settings Implementation...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  let allPassed = true

  try {
    // Test 1: Storage bucket exists
    console.log('1️⃣ Storage Bucket')
    const { data: buckets } = await supabase.storage.listBuckets()
    const logosBucket = buckets?.find(b => b.name === 'logos')
    
    if (logosBucket && logosBucket.public && logosBucket.file_size_limit === 2097152) {
      console.log('   ✅ Logos bucket configured correctly')
    } else {
      console.log('   ❌ Logos bucket not configured properly')
      allPassed = false
    }

    // Test 2: Settings table structure
    console.log('\n2️⃣ Settings Table')
    const { data: settings } = await supabase
      .from('t_settings')
      .select('key, value')
    
    const requiredKeys = ['company_info', 'footer', 'tax_rates', 'calculation_params', 'session_timeout']
    const foundKeys = settings?.map(s => s.key) || []
    
    const missingKeys = requiredKeys.filter(k => !foundKeys.includes(k))
    if (missingKeys.length === 0) {
      console.log('   ✅ All required settings present')
    } else {
      console.log('   ❌ Missing settings:', missingKeys.join(', '))
      allPassed = false
    }

    // Test 3: Company info structure
    console.log('\n3️⃣ Company Info Structure')
    const companyInfo = settings?.find(s => s.key === 'company_info')?.value
    const requiredFields = ['appName', 'name', 'address', 'phone', 'email', 'logo']
    const foundFields = Object.keys(companyInfo || {})
    
    const missingFields = requiredFields.filter(f => !foundFields.includes(f))
    if (missingFields.length === 0) {
      console.log('   ✅ Company info has all required fields')
      console.log('   - Name:', companyInfo.name)
      console.log('   - Address:', companyInfo.address)
      console.log('   - Phone:', companyInfo.phone)
      console.log('   - Email:', companyInfo.email)
      console.log('   - Logo:', companyInfo.logo || '(not set)')
    } else {
      console.log('   ❌ Missing fields:', missingFields.join(', '))
      allPassed = false
    }

    // Test 4: Footer structure
    console.log('\n4️⃣ Footer Structure')
    const footer = settings?.find(s => s.key === 'footer')?.value
    if (footer && (footer.text || typeof footer === 'string')) {
      console.log('   ✅ Footer configured correctly')
      console.log('   - Text:', footer.text || footer)
    } else {
      console.log('   ❌ Footer not configured properly')
      allPassed = false
    }

    // Test 5: Storage policies
    console.log('\n5️⃣ Storage Policies')
    const { data: files, error: listError } = await supabase
      .storage
      .from('logos')
      .list()
    
    if (!listError) {
      console.log('   ✅ Can list files in logos bucket')
    } else {
      console.log('   ❌ Cannot list files:', listError.message)
      allPassed = false
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    if (allPassed) {
      console.log('✅ All checks passed! Settings system ready.')
      console.log('\n📝 Next: Test upload logo via UI')
      console.log('   1. Start server: npm run dev')
      console.log('   2. Login as superadmin')
      console.log('   3. Go to Settings page')
      console.log('   4. Upload logo and save')
      console.log('   5. Generate PDF to verify logo appears')
    } else {
      console.log('❌ Some checks failed. Please review above.')
      process.exit(1)
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error)
    process.exit(1)
  }
}

verifySettings()
