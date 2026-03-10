'use client'

import { Button } from '@/components/ui/button'
import { Eye, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'

interface Pool {
  id: string
  period: string
  revenue_total: number
  deduction_total: number
  net_pool: number | null
  global_allocation_percentage: number
  allocated_amount: number | null
  status: 'draft' | 'approved' | 'distributed'
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

interface PoolTableProps {
  pools: Pool[]
  onView: (pool: Pool) => void
  onApprove: (poolId: string) => void
}

export default function PoolTable({ pools, onView, onApprove }: PoolTableProps) {

  function getStatusBadge(status: string) {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800',
      distributed: 'bg-blue-100 text-blue-800'
    }
    
    const labels = {
      draft: 'Draft',
      approved: 'Disetujui',
      distributed: 'Terdistribusi'
    }

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (pools.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Belum ada pool yang dibuat.</p>
        <p className="text-sm mt-2">Klik "Buat Pool" untuk membuat pool keuangan baru.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold">Periode</th>
            <th className="text-left p-3 font-semibold">Status</th>
            <th className="text-right p-3 font-semibold">Total Pendapatan</th>
            <th className="text-right p-3 font-semibold">Total Potongan</th>
            <th className="text-right p-3 font-semibold">Pool Bersih</th>
            <th className="text-right p-3 font-semibold">Jumlah Dialokasikan</th>
            <th className="text-center p-3 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {pools.map(pool => (
            <tr key={pool.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{pool.period}</td>
              <td className="p-3">{getStatusBadge(pool.status)}</td>
              <td className="p-3 text-right">{formatCurrency(pool.revenue_total)}</td>
              <td className="p-3 text-right">{formatCurrency(pool.deduction_total)}</td>
              <td className="p-3 text-right font-semibold">{formatCurrency(pool.net_pool || 0)}</td>
              <td className="p-3 text-right font-semibold text-blue-600">
                {formatCurrency(pool.allocated_amount || 0)}
              </td>
              <td className="p-3">
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(pool)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat
                  </Button>
                  {pool.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => onApprove(pool.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Setujui
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
