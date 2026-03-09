'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Edit, Check } from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const PoolTable = dynamic(() => import('@/components/pool/PoolTable'), {
  loading: () => <Skeleton className="h-96 w-full" />
})
const PoolFormDialog = dynamic(() => import('@/components/pool/PoolFormDialog'))
const PoolDetailsDialog = dynamic(() => import('@/components/pool/PoolDetailsDialog'))

interface Pool {
  id: string
  period: string
  revenue_total: number
  deduction_total: number
  net_pool: number
  global_allocation_percentage: number
  allocated_amount: number
  status: 'draft' | 'approved' | 'distributed'
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export default function PoolManagementPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)

  const loadPools = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('t_pool')
        .select('*')
        .order('period', { ascending: false })

      if (error) throw error
      setPools(data || [])
    } catch (error) {
      console.error('Error loading pools:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPools()
  }, [loadPools])

  const handleCreatePool = useCallback(() => {
    setSelectedPool(null)
    setIsFormDialogOpen(true)
  }, [])

  const handleViewPool = useCallback((pool: Pool) => {
    setSelectedPool(pool)
    setIsDetailsDialogOpen(true)
  }, [])

  const handleApprovePool = useCallback(async (poolId: string) => {
    if (!confirm('Are you sure you want to approve this pool? Once approved, it cannot be modified.')) {
      return
    }

    try {
      const supabase = createClient()
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: employee } = await supabase
        .from('m_employees')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!employee) throw new Error('Employee not found')

      // Update pool status
      const { error } = await supabase
        .from('t_pool')
        .update({
          status: 'approved',
          approved_by: employee.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', poolId)

      if (error) throw error

      alert('Pool approved successfully!')
      await loadPools()
    } catch (error: any) {
      console.error('Error approving pool:', error)
      alert(error.message || 'Failed to approve pool')
    }
  }, [loadPools])

  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Pool Management</h1>
            <p className="text-gray-600 mt-1">Manage financial pools for incentive distribution</p>
          </div>
          <Button onClick={handleCreatePool}>
            <Plus className="h-4 w-4 mr-2" />
            Create Pool
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pool History</CardTitle>
            <CardDescription>View and manage all financial pools</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <PoolTable
                pools={pools}
                onView={handleViewPool}
                onApprove={handleApprovePool}
              />
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <PoolFormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          onSuccess={loadPools}
        />

        <PoolDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          pool={selectedPool}
          onUpdate={loadPools}
        />
      </div>
  )
}
