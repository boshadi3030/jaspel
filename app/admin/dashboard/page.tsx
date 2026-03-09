import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/format'

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function DashboardMetrics() {
  try {
    const supabase = await createClient()
    
    // Get total active units
    const { count: unitsCount } = await supabase
      .from('m_units')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    // Get total active employees
    const { count: employeesCount } = await supabase
      .from('m_employees')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    // Get total pool amount from approved pools
    const { data: pools } = await supabase
      .from('t_pool')
      .select('allocated_amount')
      .eq('status', 'approved')
    
    const totalPoolAmount = pools?.reduce((sum: number, pool: any) => sum + (pool.allocated_amount || 0), 0) || 0
    
    // Get active calculations (current month)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { count: calculationCount } = await supabase
      .from('t_calculation_results')
      .select('*', { count: 'exact', head: true })
      .gte('calculated_at', startOfMonth.toISOString())
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Total Unit</CardTitle>
            <CardDescription className="text-xs">Unit organisasi aktif</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unitsCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Total Pegawai</CardTitle>
            <CardDescription className="text-xs">Pegawai aktif</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeesCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Total Pool</CardTitle>
            <CardDescription className="text-xs">Alokasi pool yang disetujui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-base font-bold break-all">{formatCurrency(totalPoolAmount)}</div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Perhitungan Aktif</CardTitle>
            <CardDescription className="text-xs">Bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculationCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading dashboard metrics:', error)
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Gagal memuat metrik dashboard. Silakan muat ulang halaman.</p>
      </div>
    )
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get role from user metadata
  const role = user.user_metadata?.role
  
  if (role !== 'superadmin') {
    redirect('/forbidden')
  }
  
  const { data: employee } = await supabase
    .from('m_employees')
    .select('id, employee_code, full_name, unit_id, tax_status, is_active, created_at, updated_at')
    .eq('user_id', user.id)
    .single()
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">Selamat datang kembali, {employee?.full_name || user.email}</p>
      </div>
      
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardMetrics />
      </Suspense>
    </div>
  )
}
