'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'

interface Pool {
  id: string
  period: string
  revenue_total: number
  deduction_total: number
  net_pool: number
  global_allocation_percentage: number
  allocated_amount: number
  status: 'draft' | 'approved' | 'distributed'
}

interface RevenueItem {
  id: string
  pool_id: string
  description: string
  amount: number
}

interface DeductionItem {
  id: string
  pool_id: string
  description: string
  amount: number
}

interface PoolDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pool: Pool | null
  onUpdate: () => void
}

export default function PoolDetailsDialog({
  open,
  onOpenChange,
  pool,
  onUpdate
}: PoolDetailsDialogProps) {
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>([])
  const [deductionItems, setDeductionItems] = useState<DeductionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Revenue form
  const [revenueForm, setRevenueForm] = useState({ description: '', amount: '' })
  const [editingRevenue, setEditingRevenue] = useState<string | null>(null)
  
  // Deduction form
  const [deductionForm, setDeductionForm] = useState({ description: '', amount: '' })
  const [editingDeduction, setEditingDeduction] = useState<string | null>(null)

  useEffect(() => {
    if (pool && open) {
      loadPoolItems()
    }
  }, [pool, open])

  async function loadPoolItems() {
    if (!pool) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      // Load revenue items
      const { data: revenueData, error: revenueError } = await supabase
        .from('t_pool_revenue')
        .select('*')
        .eq('pool_id', pool.id)
        .order('created_at')

      if (revenueError) throw revenueError
      setRevenueItems(revenueData || [])

      // Load deduction items
      const { data: deductionData, error: deductionError } = await supabase
        .from('t_pool_deduction')
        .select('*')
        .eq('pool_id', pool.id)
        .order('created_at')

      if (deductionError) throw deductionError
      setDeductionItems(deductionData || [])
    } catch (error) {
      console.error('Error loading pool items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddRevenue() {
    if (!pool || !revenueForm.description || !revenueForm.amount) return
    if (pool.status !== 'draft') {
      alert('Cannot modify approved pool')
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('t_pool_revenue')
        .insert({
          pool_id: pool.id,
          description: revenueForm.description,
          amount: parseFloat(revenueForm.amount)
        })

      if (error) throw error

      await updatePoolTotals()
      setRevenueForm({ description: '', amount: '' })
      await loadPoolItems()
      onUpdate()
    } catch (error: any) {
      console.error('Error adding revenue:', error)
      alert(error.message || 'Failed to add revenue')
    }
  }

  async function handleDeleteRevenue(id: string) {
    if (!pool || pool.status !== 'draft') {
      alert('Cannot modify approved pool')
      return
    }

    if (!confirm('Delete this revenue item?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('t_pool_revenue')
        .delete()
        .eq('id', id)

      if (error) throw error

      await updatePoolTotals()
      await loadPoolItems()
      onUpdate()
    } catch (error: any) {
      console.error('Error deleting revenue:', error)
      alert(error.message || 'Failed to delete revenue')
    }
  }

  async function handleAddDeduction() {
    if (!pool || !deductionForm.description || !deductionForm.amount) return
    if (pool.status !== 'draft') {
      alert('Cannot modify approved pool')
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('t_pool_deduction')
        .insert({
          pool_id: pool.id,
          description: deductionForm.description,
          amount: parseFloat(deductionForm.amount)
        })

      if (error) throw error

      await updatePoolTotals()
      setDeductionForm({ description: '', amount: '' })
      await loadPoolItems()
      onUpdate()
    } catch (error: any) {
      console.error('Error adding deduction:', error)
      alert(error.message || 'Failed to add deduction')
    }
  }

  async function handleDeleteDeduction(id: string) {
    if (!pool || pool.status !== 'draft') {
      alert('Cannot modify approved pool')
      return
    }

    if (!confirm('Delete this deduction item?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('t_pool_deduction')
        .delete()
        .eq('id', id)

      if (error) throw error

      await updatePoolTotals()
      await loadPoolItems()
      onUpdate()
    } catch (error: any) {
      console.error('Error deleting deduction:', error)
      alert(error.message || 'Failed to delete deduction')
    }
  }

  async function updatePoolTotals() {
    if (!pool) return

    try {
      const supabase = createClient()
      // Calculate revenue total
      const { data: revenueData } = await supabase
        .from('t_pool_revenue')
        .select('amount')
        .eq('pool_id', pool.id)

      const revenueTotal = revenueData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

      // Calculate deduction total
      const { data: deductionData } = await supabase
        .from('t_pool_deduction')
        .select('amount')
        .eq('pool_id', pool.id)

      const deductionTotal = deductionData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

      // Update pool
      const { error } = await supabase
        .from('t_pool')
        .update({
          revenue_total: revenueTotal,
          deduction_total: deductionTotal
        })
        .eq('id', pool.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating pool totals:', error)
    }
  }

  if (!pool) return null

  const isDraft = pool.status === 'draft'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pool Details - {pool.period}</DialogTitle>
          <DialogDescription>
            Status: <span className="font-semibold">{pool.status.toUpperCase()}</span>
            {!isDraft && ' (Read-only)'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg font-semibold">{formatCurrency(pool.revenue_total)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Deductions</p>
              <p className="text-lg font-semibold">{formatCurrency(pool.deduction_total)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Pool</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(pool.net_pool)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Allocated Amount ({pool.global_allocation_percentage}%)</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(pool.allocated_amount)}</p>
            </div>
          </div>

          {/* Revenue Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Revenue Items</h3>
            </div>
            
            {isDraft && (
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Description"
                  value={revenueForm.description}
                  onChange={(e) => setRevenueForm({ ...revenueForm, description: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={revenueForm.amount}
                  onChange={(e) => setRevenueForm({ ...revenueForm, amount: e.target.value })}
                  className="w-40"
                />
                <Button onClick={handleAddRevenue} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {revenueItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No revenue items</p>
              ) : (
                revenueItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-white border rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                      {isDraft && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRevenue(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Deduction Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Deduction Items</h3>
            </div>
            
            {isDraft && (
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Description"
                  value={deductionForm.description}
                  onChange={(e) => setDeductionForm({ ...deductionForm, description: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={deductionForm.amount}
                  onChange={(e) => setDeductionForm({ ...deductionForm, amount: e.target.value })}
                  className="w-40"
                />
                <Button onClick={handleAddDeduction} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {deductionItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No deduction items</p>
              ) : (
                deductionItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-white border rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                      {isDraft && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDeduction(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
