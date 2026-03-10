import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStorage() {
  console.log('Setting up storage bucket...')

  try {
    // Create public bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('public', {
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✓ Bucket already exists')
      } else {
        throw bucketError
      }
    } else {
      console.log('✓ Bucket created successfully')
    }

    console.log('\n✅ Storage setup completed!')
  } catch (error: any) {
    console.error('❌ Error setting up storage:', error.message)
    process.exit(1)
  }
}

setupStorage()
