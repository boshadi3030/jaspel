/**
 * Reset Password - Update user password di Supabase Auth
 * 
 * Usage:
 * npx tsx scripts/reset-password.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diset di .env.local')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetPassword() {
  console.log('🔐 Mereset password user...\n')

  const email = 'mukhsin9@gmail.com'
  const newPassword = 'Jlamprang233!!'

  try {
    // Get user by email
    console.log('🔍 Mencari user...')
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) throw listError

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.error('❌ User tidak ditemukan!')
      process.exit(1)
    }

    console.log('✅ User ditemukan:', user.id)

    // Update password
    console.log('\n🔄 Mengupdate password...')
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        password: newPassword,
        email_confirm: true
      }
    )

    if (error) throw error

    console.log('✅ Password berhasil direset!')
    console.log('\n🔐 Kredensial Login:')
    console.log('   Email:', email)
    console.log('   Password:', newPassword)
    console.log('\n🌐 Silakan login di: http://localhost:3000/login')

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

// Run
resetPassword()
