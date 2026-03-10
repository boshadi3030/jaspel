import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testSettingsAndLogo() {
  console.log('🧪 Testing Settings & Logo Upload...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test 1: Check storage bucket
    console.log('1️⃣ Checking storage bucket...')
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets()

    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError)
    } else {
      const logosBucket = buckets.find(b => b.name === 'logos')
      if (logosBucket) {
        console.log('✅ Logos bucket exists')
        console.log('   - Public:', logosBucket.public)
        console.log('   - File size limit:', logosBucket.file_size_limit, 'bytes')
      } else {
        console.log('❌ Logos bucket not found')
      }
    }

    // Test 2: Check settings table structure
    console.log('\n2️⃣ Checking settings table...')
    const { data: settings, error: settingsError } = await supabase
      .from('t_settings')
      .select('key, value')

    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError)
    } else {
      console.log('✅ Settings table accessible')
      console.log('   Found', settings.length, 'settings')
      
      // Check company_info
      const companyInfo = settings.find(s => s.key === 'company_info')
      if (companyInfo) {
        console.log('\n   Company Info:')
        console.log('   - Name:', companyInfo.value.name)
        console.log('   - Address:', companyInfo.value.address)
        console.log('   - Phone:', companyInfo.value.phone || 'Not set')
        console.log('   - Email:', companyInfo.value.email || 'Not set')
        console.log('   - Logo:', companyInfo.value.logo ? '✅ Set' : '❌ Not set')
      }
      
      // Check footer
      const footer = settings.find(s => s.key === 'footer')
      if (footer) {
        console.log('\n   Footer:')
        const footerText = typeof footer.value === 'string' ? footer.value : footer.value.text
        console.log('   - Text:', footerText)
      }
    }

    // Test 3: Test storage policies
    console.log('\n3️⃣ Testing storage policies...')
    
    // Try to list files in logos bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from('logos')
      .list()

    if (listError) {
      console.error('❌ Error listing files:', listError)
    } else {
      console.log('✅ Can list files in logos bucket')
      console.log('   Found', files.length, 'files')
      
      if (files.length > 0) {
        console.log('\n   Files:')
        files.forEach(file => {
          console.log('   -', file.name, `(${file.metadata?.size || 0} bytes)`)
        })
      }
    }

    // Test 4: Check API endpoint
    console.log('\n4️⃣ Testing settings API endpoint...')
    try {
      const response = await fetch('http://localhost:3002/api/settings')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Settings API working')
        console.log('   - Company Name:', data.companyInfo?.name)
        console.log('   - Footer:', data.footer?.text || data.footer)
      } else {
        console.log('❌ Settings API returned error:', response.status)
      }
    } catch (error: any) {
      console.log('⚠️  Could not reach API (server may not be running):', error.message)
    }

    console.log('\n✅ Settings & Logo test completed!')
    console.log('\n📝 Next steps:')
    console.log('   1. Go to http://localhost:3002/settings')
    console.log('   2. Fill in organization information')
    console.log('   3. Upload a logo (max 2MB)')
    console.log('   4. Save settings')
    console.log('   5. Check that logo appears in PDF reports')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

testSettingsAndLogo()
