import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/format'

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

async function DashboardMetrics({ employeeId, period }: { employeeId: string; period: string }) {
  const supabase = await createClient()
  
  // Get individual scores for current period
  const { data: scores } = await supabase
    .from('t_individual_scores')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('period', period)
    .single()
  
  // Get calculation result for current period
  const { data: result } = await supabase
    .from('t_calculation_results')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('period', period)
    .single()
  
  // Get incentive history for last 6 months
  const { data: history } = await supabase
    .from('t_calculation_results')
    .select('period, net_incentive, final_score')
    .eq('employee_id', employeeId)
    .order('period', { ascending: false })
    .limit(6)
  
  return (
    <div className="space-y-6">
      {/* KPI Scores */}
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
      
      {/* Current Incentive */}
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
      
      {/* Incentive History */}
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

export default async function EmployeeDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get role from user metadata
  const role = user.user_metadata?.role
  
  if (role !== 'employee') {
    redirect('/forbidden')
  }
  
  const { data: employee } = await supabase
    .from('m_employees')
    .select('id, employee_code, full_name, unit_id, tax_status, m_units(name)')
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
          <h1 className="text-3xl font-bold">Dashboard Pegawai</h1>
          <p className="text-gray-500">
            {employee.full_name} - {(employee.m_units as any)?.name}
          </p>
        </div>
        
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardMetrics employeeId={employee.id} period={currentPeriod} />
        </Suspense>
      </div>
  )
}
