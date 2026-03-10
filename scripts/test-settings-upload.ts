import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testSettingsUpload() {
  console.log('🧪 Testing Settings Upload System...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Check storage bucket
    console.log('1️⃣ Checking storage bucket...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('❌ Error checking buckets:', bucketError)
      return
    }

    const publicBucket = buckets?.find(b => b.name === 'public')
    if (publicBucket) {
      console.log('✅ Storage bucket "public" exists')
      console.log(`   - Public: ${publicBucket.public}`)
      console.log(`   - File size limit: ${publicBucket.file_size_limit} bytes (${(publicBucket.file_size_limit / 1024 / 1024).toFixed(2)} MB)`)
      console.log(`   - Allowed types: ${publicBucket.allowed_mime_types?.join(', ')}`)
    } else {
      console.log('❌ Storage bucket "public" not found')
      return
    }

    // 2. Check current settings
    console.log('\n2️⃣ Checking current settings...')
    const { data: settings, error: settingsError } = await supabase
      .from('t_settings')
      .select('key, value, description')
      .order('key')

    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError)
      return
    }

    console.log('✅ Current settings:')
    settings?.forEach(s => {
      console.log(`   - ${s.key}:`, JSON.stringify(s.value, null, 2).substring(0, 100))
    })

    // 3. Check company_info specifically
    console.log('\n3️⃣ Checking company_info...')
    const companyInfo = settings?.find(s => s.key === 'company_info')
    if (companyInfo) {
      console.log('✅ Company info found:')
      console.log('   ', JSON.stringify(companyInfo.value, null, 2))
      
      const info = companyInfo.value as any
      if (info.logo) {
        console.log(`\n   Logo URL: ${info.logo}`)
        
        // Try to check if logo is accessible
        try {
          const response = await fetch(info.logo)
          if (response.ok) {
            console.log('   ✅ Logo is accessible')
          } else {
            console.log(`   ⚠️ Logo returned status: ${response.status}`)
          }
        } catch (e) {
          console.log('   ⚠️ Could not verify logo accessibility')
        }
      } else {
        console.log('   ℹ️ No logo configured yet')
      }
    } else {
      console.log('⚠️ Company info not found')
    }

    // 4. Check footer setting
    console.log('\n4️⃣ Checking footer setting...')
    const footer = settings?.find(s => s.key === 'footer')
    if (footer) {
      console.log('✅ Footer found:', JSON.stringify(footer.value, null, 2))
    } else {
      console.log('⚠️ Footer not found')
    }

    // 5. List files in logos folder
    console.log('\n5️⃣ Checking uploaded logos...')
    const { data: files, error: listError } = await supabase.storage
      .from('public')
      .list('logos', {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (listError) {
      console.log('⚠️ Error listing files:', listError.message)
    } else if (files && files.length > 0) {
      console.log(`✅ Found ${files.length} logo file(s):`)
      files.forEach(f => {
        console.log(`   - ${f.name} (${(f.metadata?.size / 1024).toFixed(2)} KB)`)
      })
    } else {
      console.log('ℹ️ No logo files uploaded yet')
    }

    console.log('\n✅ Settings upload system test completed!')
    console.log('\n📝 Next steps:')
    console.log('   1. Go to http://localhost:3002/settings')
    console.log('   2. Upload a logo (max 2MB, PNG/JPG/SVG)')
    console.log('   3. Fill in organization details')
    console.log('   4. Click "Simpan Pengaturan"')
    console.log('   5. Check if logo appears in sidebar and footer text updates')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSettingsUpload()
