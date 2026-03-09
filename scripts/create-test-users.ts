import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUsers() {
  console.log('Creating test users in Supabase Auth...\n')

  const users = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      role: 'superadmin',
      name: 'Admin System'
    },
    {
      email: 'john.doe@example.com',
      password: 'manager123',
      role: 'unit_manager',
      name: 'John Doe'
    },
    {
      email: 'jane.smith@example.com',
      password: 'employee123',
      role: 'employee',
      name: 'Jane Smith'
    },
    {
      email: 'alice.johnson@example.com',
      password: 'manager123',
      role: 'unit_manager',
      name: 'Alice Johnson'
    }
  ]

  for (const user of users) {
    try {
      console.log(`Creating user: ${user.email}`)
      
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const userExists = existingUsers?.users.some(u => u.email === user.email)
      
      if (userExists) {
        console.log(`  ✓ User already exists: ${user.email}`)
        
        // Update password
        const existingUser = existingUsers?.users.find(u => u.email === user.email)
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: user.password }
          )
          
          if (updateError) {
            console.log(`  ✗ Failed to update password: ${updateError.message}`)
          } else {
            console.log(`  ✓ Password updated for: ${user.email}`)
          }
        }
      } else {
        // Create new user
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.name,
            role: user.role
          }
        })

        if (error) {
          console.log(`  ✗ Failed to create user: ${error.message}`)
        } else {
          console.log(`  ✓ User created successfully: ${user.email}`)
          console.log(`    User ID: ${data.user.id}`)
        }
      }
      
      console.log('')
    } catch (err: any) {
      console.error(`  ✗ Error: ${err.message}\n`)
    }
  }

  console.log('\n=== Test Credentials ===')
  console.log('Superadmin:')
  console.log('  Email: admin@example.com')
  console.log('  Password: admin123')
  console.log('')
  console.log('Unit Manager:')
  console.log('  Email: john.doe@example.com')
  console.log('  Password: manager123')
  console.log('')
  console.log('Employee:')
  console.log('  Email: jane.smith@example.com')
  console.log('  Password: employee123')
  console.log('')
}

createTestUsers()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })
