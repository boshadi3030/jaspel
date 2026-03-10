import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, email, role, unit_id, employee_id } = body
    
    const supabase = await createClient()
    
    // Verify user is authenticated and is superadmin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Tidak terautentikasi' }, { status: 401 })
    }
    
    // Check if user is superadmin from user metadata
    const userRole = authUser.user_metadata?.role
    if (userRole !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Tidak memiliki akses' }, { status: 403 })
    }
    
    // Use admin client for auth operations
    const adminClient = await createAdminClient()
    
    // Update auth user metadata
    const updateData: any = {}
    if (email) updateData.email = email
    
    // Build user_metadata object
    const userMetadata: any = {}
    if (role) userMetadata.role = role
    if (unit_id) userMetadata.unit_id = unit_id
    
    if (Object.keys(userMetadata).length > 0) {
      // Get existing metadata first
      const { data: existingUser } = await adminClient.auth.admin.getUserById(id)
      updateData.user_metadata = {
        ...existingUser?.user?.user_metadata,
        ...userMetadata
      }
    }
    
    const { error: authError } = await adminClient.auth.admin.updateUserById(id, updateData)
    
    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 500 })
    }
    
    // Update employee record if unit_id changed
    if (unit_id !== undefined) {
      const { error: employeeError } = await adminClient
        .from('m_employees')
        .update({ unit_id })
        .eq('user_id', id)
      
      if (employeeError) {
        return NextResponse.json({ success: false, error: employeeError.message }, { status: 500 })
      }
    }
    
    // Update employee link if employee_id changed
    if (employee_id !== undefined) {
      // Remove old link if exists
      await adminClient
        .from('m_employees')
        .update({ user_id: null })
        .eq('user_id', id)
      
      // Add new link if employee_id is provided
      if (employee_id) {
        const { error: employeeError } = await adminClient
          .from('m_employees')
          .update({ user_id: id })
          .eq('id', employee_id)
        
        if (employeeError) {
          return NextResponse.json({ success: false, error: employeeError.message }, { status: 500 })
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
