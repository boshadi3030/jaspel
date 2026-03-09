import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetPassword(email: string, newPassword: string) {
  console.log('='.repeat(60))
  console.log('RESETTING USER PASSWORD')
  console.log('='.repeat(60))
  console.log('')
  console.log('Email:', email)
  console.log('New Password:', newPassword)
  console.log('')

  try {
    // Get user by email
    console.log('Step 1: Finding user...')
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError)
      return
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.error('❌ User not found:', email)
      return
    }

    console.log('✅ User found:', user.id)
    console.log('')

    // Update password
    console.log('Step 2: Updating password...')
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (error) {
      console.error('❌ Error updating password:', error)
      return
    }

    console.log('✅ Password updated successfully!')
    console.log('')

    // Verify user is active in m_employees
    console.log('Step 3: Verifying employee record...')
    const { data: employee, error: empError } = await supabase
      .from('m_employees')
      .select('email, full_name, role, is_active')
      .eq('email', email)
      .single()

    if (empError) {
      console.error('❌ Error fetching employee:', empError)
      return
    }

    console.log('✅ Employee record:')
    console.log('  Name:', employee.full_name)
    console.log('  Role:', employee.role)
    console.log('  Active:', employee.is_active ? '✅' : '❌')
    console.log('')

    if (!employee.is_active) {
      console.log('⚠️  User is inactive. Activating...')
      const { error: updateError } = await supabase
        .from('m_employees')
        .update({ is_active: true })
        .eq('email', email)

      if (updateError) {
        console.error('❌ Error activating user:', updateError)
      } else {
        console.log('✅ User activated')
      }
      console.log('')
    }

    console.log('='.repeat(60))
    console.log('PASSWORD RESET COMPLETE!')
    console.log('='.repeat(60))
    console.log('')
    console.log('You can now login with:')
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${newPassword}`)
    console.log('')
    console.log('Test at: http://localhost:3000/login')
    console.log('')

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Get credentials from command line
const email = process.argv[2] || 'mukhsin9@gmail.com'
const newPassword = process.argv[3] || 'admin123'

resetPassword(email, newPassword)
