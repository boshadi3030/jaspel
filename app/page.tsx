import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      redirect('/login')
    }
    
    // Get user role to redirect to appropriate dashboard
    const { data: employee } = await supabase
      .from('m_employees')
      .select('role')
      .eq('user_id', session.user.id)
      .single()
    
    if (employee) {
      switch (employee.role) {
        case 'superadmin':
          redirect('/admin/dashboard')
        case 'unit_manager':
          redirect('/manager/dashboard')
        case 'employee':
          redirect('/employee/dashboard')
        default:
          redirect('/login')
      }
    }
    
    redirect('/login')
  } catch (error) {
    redirect('/login')
  }
}
