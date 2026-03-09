import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnitTable } from '@/components/units/UnitTable'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UnitsPage() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      redirect('/login')
    }
    
    // Check role from user metadata
    const role = user.user_metadata?.role
    
    if (role !== 'superadmin') {
      redirect('/forbidden')
    }
    
    // Verify employee exists and is active
    const { data: employee, error: employeeError } = await supabase
      .from('m_employees')
      .select('is_active')
      .eq('user_id', user.id)
      .single()
    
    if (employeeError || !employee || !employee.is_active) {
      redirect('/forbidden')
    }
    
    // Get all units with employee count
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('*')
      .order('code', { ascending: true })
    
    if (unitsError) {
      console.error('Error fetching units:', unitsError)
      throw new Error('Failed to fetch units')
    }
    
    // Get employee counts for each unit
    const unitsWithCounts = await Promise.all(
      (units || []).map(async (unit) => {
        const { count } = await supabase
          .from('m_employees')
          .select('*', { count: 'exact', head: true })
          .eq('unit_id', unit.id)
        
        return {
          ...unit,
          employees: [{ count: count || 0 }]
        }
      })
    )
    
    return (
      <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Unit Management</h1>
              <p className="text-gray-500">Manage organizational units</p>
            </div>
          </div>
          
          <UnitTable units={unitsWithCounts} />
        </div>
    )
  } catch (error) {
    console.error('Error in UnitsPage:', error)
    return (
      <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Units</h2>
            <p className="text-red-600">
              Failed to load units. Please try refreshing the page or contact support.
            </p>
          </div>
        </div>
    )
  }
}
