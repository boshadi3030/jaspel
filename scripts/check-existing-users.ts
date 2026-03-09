import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkUsers() {
  console.log('🔍 Checking existing users...\n')

  try {
    // Get all auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    console.log(`Found ${authData.users.length} auth users:\n`)
    
    for (const user of authData.users) {
      console.log('---')
      console.log('Email:', user.email)
      console.log('ID:', user.id)
      console.log('Role:', user.user_metadata?.role || 'not set')
      console.log('Created:', user.created_at)
      
      // Check employee record
      const { data: employee } = await supabase
        .from('m_employees')
        .select('full_name, is_active, unit_id')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (employee) {
        console.log('Employee:', employee.full_name)
        console.log('Active:', employee.is_active)
        console.log('Unit ID:', employee.unit_id)
      } else {
        console.log('⚠️  No employee record found')
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkUsers()
