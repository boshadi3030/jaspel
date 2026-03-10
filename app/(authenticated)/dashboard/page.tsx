import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/format'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Loading skeleton
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

// Superadmin Dashboard Metrics
async function SuperadminMetrics() {
  try {
    const supabase = await createClient()
    
    const { count: unitsCount } = await supabase
      .from('m_units')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    const { count: employeesCount } = await supabase
      .from('m_employees')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    const { data: pools } = await supabase
      .from('t_pool')
      .select('allocated_amount')
      .eq('status', 'approved')
    
    const totalPoolAmount = pools?.reduce((sum: number, pool: any) => sum + (pool.allocated_amount || 0), 0) || 0
    
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
    console.error('Error loading superadmin metrics:', error)
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Gagal memuat metrik dashboard. Silakan muat ulang halaman.</p>
      </div>
    )
  }
}

// Manager Dashboard Metrics
async function ManagerMetrics({ unitId, period }: { unitId: string; period: string }) {
  const supabase = await createClient()

  const { data: unitScore } = await supabase
    .from('t_unit_scores')
    .select('total_score')
    .eq('unit_id', unitId)
    .eq('period', period)
    .single()

  const { count: employeeCount } = await supabase
    .from('m_employees')
    .select('*', { count: 'exact', head: true })
    .eq('unit_id', unitId)
    .eq('is_active', true)

  const { data: employees } = await supabase
    .from('m_employees')
    .select('id')
    .eq('unit_id', unitId)
    .eq('is_active', true)

  const employeeIds = employees?.map(e => e.id) || []

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

// Employee Dashboard Metrics
async function EmployeeMetrics({ employeeId, period }: { employeeId: string; period: string }) {
  const supabase = await createClient()
  
  const { data: scores } = await supabase
    .from('t_individual_scores')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('period', period)
    .single()
  
  const { data: result } = await supabase
    .from('t_calculation_results')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('period', period)
    .single()
  
  const { data: history } = await supabase
    .from('t_calculation_results')
    .select('period, net_incentive, final_score')
    .eq('employee_id', employeeId)
    .order('period', { ascending: false })
    .limit(6)
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Skor P1</CardTitle>
            <CardDescription>Kinerja Posisi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {scores?.p1_score?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skor P2</CardTitle>
            <CardDescription>Kinerja Output</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {scores?.p2_score?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skor P3</CardTitle>
            <CardDescription>Perilaku/Potensi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {scores?.p3_score?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Insentif untuk {period}</CardTitle>
          <CardDescription>Detail perhitungan insentif Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Total Skor</span>
                <span className="font-semibold">{result.final_score?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Insentif Bruto</span>
                <span className="font-semibold">{formatCurrency(result.gross_incentive || 0)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Pajak (PPh 21)</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(result.tax_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold">Insentif Netto</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(result.net_incentive || 0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data insentif untuk periode ini
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Insentif</CardTitle>
          <CardDescription>6 bulan terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.period} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{item.period}</div>
                    <div className="text-sm text-gray-500">
                      Skor: {item.final_score?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(item.net_incentive || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada riwayat insentif
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  // Get role from user_metadata
  const role = user.user_metadata?.role as 'superadmin' | 'unit_manager' | 'employee'
  
  if (!role) {
    redirect('/login')
  }
  
  const { data: employee } = await supabase
    .from('m_employees')
    .select('id, employee_code, full_name, unit_id, m_units(name)')
    .eq('user_id', user.id)
    .single()
  
  if (!employee) {
    redirect('/login')
  }

  const currentPeriod = new Date().toISOString().slice(0, 7)
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {role === 'superadmin' ? 'Dashboard' : 
           role === 'unit_manager' ? 'Dashboard Manajer Unit' : 
           'Dashboard Pegawai'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Selamat datang kembali, {employee.full_name}
          {role !== 'superadmin' && (employee.m_units as any)?.name && 
            ` - ${(employee.m_units as any).name}`}
        </p>
      </div>
      
      <Suspense fallback={<DashboardSkeleton />}>
        {role === 'superadmin' && <SuperadminMetrics />}
        {role === 'unit_manager' && <ManagerMetrics unitId={employee.unit_id} period={currentPeriod} />}
        {role === 'employee' && <EmployeeMetrics employeeId={employee.id} period={currentPeriod} />}
      </Suspense>
    </div>
  )
}
