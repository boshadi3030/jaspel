'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Copy } from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const KPITree = dynamic(() => import('@/components/kpi/KPITree'), {
  loading: () => <Skeleton className="h-96 w-full" />
})
const CategoryFormDialog = dynamic(() => import('@/components/kpi/CategoryFormDialog'))
const IndicatorFormDialog = dynamic(() => import('@/components/kpi/IndicatorFormDialog'))
const CopyStructureDialog = dynamic(() => import('@/components/kpi/CopyStructureDialog'))

interface Unit {
  id: string
  code: string
  name: string
}

interface KPICategory {
  id: string
  unit_id: string
  category: 'P1' | 'P2' | 'P3'
  category_name: string
  weight_percentage: number
  description: string | null
  is_active: boolean
}

interface KPIIndicator {
  id: string
  category_id: string
  code: string
  name: string
  target_value: number
  weight_percentage: number
  measurement_unit: string | null
  description: string | null
  is_active: boolean
}

export default function KPIConfigPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [categories, setCategories] = useState<KPICategory[]>([])
  const [indicators, setIndicators] = useState<KPIIndicator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<KPICategory | null>(null)
  const [selectedIndicator, setSelectedIndicator] = useState<KPIIndicator | null>(null)

  const loadUnits = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('m_units')
        .select('id, code, name')
        .eq('is_active', true)
        .order('code')

      if (error) throw error
      setUnits(data || [])
      if (data && data.length > 0 && !selectedUnit) {
        setSelectedUnit(data[0].id)
      }
    } catch (error) {
      console.error('Error loading units:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedUnit])

  const loadKPIStructure = useCallback(async () => {
    if (!selectedUnit) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('m_kpi_categories')
        .select('*')
        .eq('unit_id', selectedUnit)
        .order('category')

      if (categoriesError) throw categoriesError
      setCategories(categoriesData || [])

      // Load indicators
      const categoryIds = categoriesData?.map(c => c.id) || []
      if (categoryIds.length > 0) {
        const { data: indicatorsData, error: indicatorsError } = await supabase
          .from('m_kpi_indicators')
          .select('*')
          .in('category_id', categoryIds)
          .order('code')

        if (indicatorsError) throw indicatorsError
        setIndicators(indicatorsData || [])
      } else {
        setIndicators([])
      }
    } catch (error) {
      console.error('Error loading KPI structure:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedUnit])

  useEffect(() => {
    loadUnits()
  }, [loadUnits])

  useEffect(() => {
    if (selectedUnit) {
      loadKPIStructure()
    }
  }, [selectedUnit, loadKPIStructure])

  const handleAddCategory = useCallback(() => {
    setSelectedCategory(null)
    setIsCategoryDialogOpen(true)
  }, [])

  const handleEditCategory = useCallback((category: KPICategory) => {
    setSelectedCategory(category)
    setIsCategoryDialogOpen(true)
  }, [])

  const handleAddIndicator = useCallback((categoryId: string) => {
    setSelectedCategory(categories.find(c => c.id === categoryId) || null)
    setSelectedIndicator(null)
    setIsIndicatorDialogOpen(true)
  }, [categories])

  const handleEditIndicator = useCallback((indicator: KPIIndicator) => {
    setSelectedIndicator(indicator)
    setIsIndicatorDialogOpen(true)
  }, [])

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    // Check if category has indicators
    const categoryIndicators = indicators.filter(i => i.category_id === categoryId)

    if (categoryIndicators.length > 0) {
      if (!confirm('This category has indicators. Deleting it will also delete all indicators. Continue?')) {
        return
      }
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('m_kpi_categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error
      await loadKPIStructure()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }, [indicators, loadKPIStructure])

  const handleDeleteIndicator = useCallback(async (indicatorId: string) => {
    const supabase = createClient()
    // Check if indicator has realization data
    const { data: realizationData, error: realizationError } = await supabase
      .from('t_realization')
      .select('id')
      .eq('indicator_id', indicatorId)
      .limit(1)

    if (realizationError) {
      console.error('Error checking realization data:', realizationError)
      return
    }

    if (realizationData && realizationData.length > 0) {
      if (!confirm('This indicator has existing realization data. Deletion will affect historical calculations. Continue?')) {
        return
      }
    }

    try {
      const { error } = await supabase
        .from('m_kpi_indicators')
        .delete()
        .eq('id', indicatorId)

      if (error) throw error
      await loadKPIStructure()
    } catch (error) {
      console.error('Error deleting indicator:', error)
      alert('Failed to delete indicator')
    }
  }, [loadKPIStructure])

  const handleCopyStructure = useCallback(() => {
    setIsCopyDialogOpen(true)
  }, [])

  const handleCopyComplete = useCallback(async () => {
    await loadKPIStructure()
    setIsCopyDialogOpen(false)
  }, [loadKPIStructure])

  if (isLoading && units.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">KPI Configuration</h1>
            <p className="text-gray-600 mt-1">Configure KPI categories and indicators for each unit</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCopyStructure} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copy Structure
            </Button>
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Unit Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Unit</CardTitle>
            <CardDescription>Choose a unit to view and configure its KPI structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {units.map(unit => (
                <Button
                  key={unit.id}
                  variant={selectedUnit === unit.id ? 'default' : 'outline'}
                  onClick={() => setSelectedUnit(unit.id)}
                >
                  {unit.code} - {unit.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* KPI Tree */}
        {selectedUnit && (
          <Card>
            <CardHeader>
              <CardTitle>KPI Structure</CardTitle>
              <CardDescription>
                Categories (P1, P2, P3) and their indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <KPITree
                  categories={categories}
                  indicators={indicators}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onAddIndicator={handleAddIndicator}
                  onEditIndicator={handleEditIndicator}
                  onDeleteIndicator={handleDeleteIndicator}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <CategoryFormDialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
          category={selectedCategory}
          unitId={selectedUnit}
          existingCategories={categories}
          onSuccess={loadKPIStructure}
        />

        <IndicatorFormDialog
          open={isIndicatorDialogOpen}
          onOpenChange={setIsIndicatorDialogOpen}
          indicator={selectedIndicator}
          category={selectedCategory}
          existingIndicators={indicators.filter(i => i.category_id === selectedCategory?.id)}
          onSuccess={loadKPIStructure}
        />

        <CopyStructureDialog
          open={isCopyDialogOpen}
          onOpenChange={setIsCopyDialogOpen}
          units={units}
          sourceUnitId={selectedUnit}
          onSuccess={handleCopyComplete}
        />
      </div>
  )
}
