import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function resetSuperadminPassword() {
  console.log('🔧 Resetting superadmin password...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Find user by email
    const email = 'mukhsin9@gmail.com'
    const newPassword = 'admin123'

    console.log('1. Finding user:', email)
    
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError)
      return
    }

    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.error('❌ User not found:', email)
      return
    }

    console.log('✅ User found:', user.id)
    console.log('   Email:', user.email)
    console.log('   Role:', user.user_metadata?.role)

    // Update password
    console.log('\n2. Updating password...')
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return
    }

    console.log('✅ Password updated successfully!')
    console.log('\n📋 Login credentials:')
    console.log('   Email:', email)
    console.log('   Password:', newPassword)
    console.log('\n✅ You can now login with these credentials')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

resetSuperadminPassword()
