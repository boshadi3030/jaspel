import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function DashboardMetrics({ unitId, period }: { unitId: string; period: string }) {
  const supabase = await createClient()

  // Get unit's average KPI score
  const { data: unitScore } = await supabase
    .from('t_unit_scores')
    .select('total_score')
    .eq('unit_id', unitId)
    .eq('period', period)
    .single()

  // Get number of employees in the unit
  const { count: employeeCount } = await supabase
    .from('m_employees')
    .select('*', { count: 'exact', head: true })
    .eq('unit_id', unitId)
    .eq('is_active', true)

  // Get employee IDs in this unit
  const { data: employees } = await supabase
    .from('m_employees')
    .select('id')
    .eq('unit_id', unitId)
    .eq('is_active', true)

  const employeeIds = employees?.map(e => e.id) || []

  // Get pending realization entries (where achievement_percentage is null)
  let pendingCount = 0
  if (employeeIds.length > 0) {
    const { count } = await supabase
      .from('t_realization')
      .select('*', { count: 'exact', head: true })
      .eq('period', period)
      .is('achievement_percentage', null)
      .in('employee_id', employeeIds)

    pendingCount = count || 0
  }

  const averageScore = unitScore?.total_score || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Rata-rata KPI Unit</CardTitle>
          <CardDescription>Skor periode saat ini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{averageScore.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anggota Tim</CardTitle>
          <CardDescription>Pegawai aktif di unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{employeeCount || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Realisasi Tertunda</CardTitle>
          <CardDescription>Entri menunggu input</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{pendingCount || 0}</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function ManagerDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get role from user metadata
  const role = user.user_metadata?.role
  
  if (role !== 'unit_manager') {
    redirect('/forbidden')
  }

  const { data: employee } = await supabase
    .from('m_employees')
    .select('id, employee_code, full_name, unit_id, m_units(name)')
    .eq('user_id', user.id)
    .single()

  if (!employee) {
    redirect('/forbidden')
  }

  // Get current period (YYYY-MM format)
  const currentPeriod = new Date().toISOString().slice(0, 7)

  return (
    <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Manajer Unit</h1>
          <p className="text-gray-500">
            {employee.full_name} - {(employee.m_units as any)?.name}
          </p>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardMetrics unitId={employee.unit_id} period={currentPeriod} />
        </Suspense>
      </div>
  )
}
