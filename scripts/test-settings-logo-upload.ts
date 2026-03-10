import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLogoUpload() {
  console.log('🧪 Testing Logo Upload with Authentication...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Login as superadmin
    console.log('1️⃣ Logging in as superadmin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    })

    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }

    console.log('✅ Logged in successfully')
    console.log('   User ID:', authData.user?.id)

    // 2. Check settings access
    console.log('\n2️⃣ Testing settings access...')
    const { data: settingsData, error: settingsError } = await supabase
      .from('t_settings')
      .select('key, value')

    if (settingsError) {
      console.error('❌ Failed to access settings:', settingsError.message)
      return
    }

    console.log('✅ Settings accessible')
    console.log('   Keys found:', settingsData?.map(s => s.key).join(', '))

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
      } else {
        console.log('❌ Logos bucket not found')
      }
    }

    // 4. Test file upload
    console.log('\n4️⃣ Testing file upload...')
    
    // Create a simple test image (1x1 PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    
    const testFileName = `test-logo-${Date.now()}.png`
    const testFile = new Blob([testImageBuffer], { type: 'image/png' })

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(testFileName, testFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message)
      console.log('   Error details:', uploadError)
    } else {
      console.log('✅ Upload successful')
      console.log('   Path:', uploadData.path)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(testFileName)

      console.log('   Public URL:', publicUrl)

      // 5. Test updating settings with logo URL
      console.log('\n5️⃣ Testing settings update with logo URL...')
      
      const { data: currentSettings } = await supabase
        .from('t_settings')
        .select('value')
        .eq('key', 'company_info')
        .single()

      const companyInfo = {
        ...(currentSettings?.value || {}),
        logo: publicUrl
      }

      const { error: updateError } = await supabase
        .from('t_settings')
        .update({
          value: companyInfo,
          updated_by: authData.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'company_info')

      if (updateError) {
        console.error('❌ Settings update failed:', updateError.message)
      } else {
        console.log('✅ Settings updated with logo URL')
      }

      // 6. Clean up test file
      console.log('\n6️⃣ Cleaning up test file...')
      const { error: deleteError } = await supabase.storage
        .from('logos')
        .remove([testFileName])

      if (deleteError) {
        console.error('❌ Cleanup failed:', deleteError.message)
      } else {
        console.log('✅ Test file removed')
      }
    }

    // 7. Verify all settings are present
    console.log('\n7️⃣ Verifying all settings...')
    const requiredKeys = ['company_info', 'footer', 'tax_rates', 'calculation_params', 'session_timeout']
    
    for (const key of requiredKeys) {
      const { data, error } = await supabase
        .from('t_settings')
        .select('value')
        .eq('key', key)
        .single()

      if (error || !data) {
        console.log(`❌ ${key}: Missing or inaccessible`)
      } else {
        console.log(`✅ ${key}: Present`)
      }
    }

    console.log('\n✅ Logo upload test completed!')

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
  }
}

testLogoUpload()
