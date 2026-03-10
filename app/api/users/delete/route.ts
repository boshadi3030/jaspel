import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID diperlukan' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Verify user is authenticated and is superadmin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }
    
    const userRole = authUser.user_metadata?.role
    if (userRole !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Tidak memiliki akses' },
        { status: 403 }
      )
    }
    
    // Prevent self-deletion
    if (userId === authUser.id) {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menghapus akun sendiri' },
        { status: 400 }
      )
    }
    
    // Delete employee record first (will cascade to related data)
    const { error: employeeError } = await supabase
      .from('m_employees')
      .delete()
      .eq('user_id', userId)
    
    if (employeeError) {
      return NextResponse.json(
        { success: false, error: employeeError.message },
        { status: 500 }
      )
    }
    
    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
