'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Copy, Download, Building2 } from 'lucide-react'
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
    const categoryIndicators = indicators.filter(i => i.category_id === categoryId)

    if (categoryIndicators.length > 0) {
      if (!confirm('Kategori ini memiliki indikator. Menghapusnya akan menghapus semua indikator. Lanjutkan?')) {
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
      alert('Gagal menghapus kategori')
    }
  }, [indicators, loadKPIStructure])

  const handleDeleteIndicator = useCallback(async (indicatorId: string) => {
    const supabase = createClient()
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
      if (!confirm('Indikator ini memiliki data realisasi. Penghapusan akan mempengaruhi perhitungan historis. Lanjutkan?')) {
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
      alert('Gagal menghapus indikator')
    }
  }, [loadKPIStructure])

  const handleCopyStructure = useCallback(() => {
    setIsCopyDialogOpen(true)
  }, [])

  const handleCopyComplete = useCallback(async () => {
    await loadKPIStructure()
    setIsCopyDialogOpen(false)
  }, [loadKPIStructure])

  const handleDownloadGuide = useCallback(() => {
    window.open('/api/kpi-config/guide', '_blank')
  }, [])

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
          <h1 className="text-3xl font-bold">Konfigurasi KPI</h1>
          <p className="text-gray-600 mt-1">Konfigurasi kategori dan indikator KPI untuk setiap unit</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleDownloadGuide} 
            className="bg-purple-500 hover:bg-purple-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Unduh Petunjuk PDF
          </Button>
          <Button 
            onClick={handleCopyStructure} 
            className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Copy className="h-4 w-4 mr-2" />
            Salin Struktur
          </Button>
          <Button 
            onClick={handleAddCategory}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kategori
          </Button>
        </div>
      </div>

      {/* Unit Selector */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Building2 className="h-5 w-5" />
            <span className="text-xl">Pilih Unit</span>
            <span className="text-sm font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {units.length} unit
            </span>
          </CardTitle>
          <CardDescription className="text-blue-700">Pilih unit untuk melihat dan mengkonfigurasi struktur KPI</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Select value={selectedUnit || undefined} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-full h-14 text-base font-medium border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm">
              <SelectValue placeholder="Pilih unit..." />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {units.map(unit => (
                <SelectItem 
                  key={unit.id} 
                  value={unit.id}
                  className="text-base py-3 cursor-pointer hover:bg-blue-50 focus:bg-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">{unit.code}</span>
                    <span className="text-gray-700">{unit.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Quick Unit Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Akses Cepat:</p>
            <div className="flex flex-wrap gap-2">
              {units.slice(0, 6).map(unit => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                    selectedUnit === unit.id
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {unit.code}
                </button>
              ))}
              {units.length > 6 && (
                <span className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  +{units.length - 6} lainnya
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Tree */}
      {selectedUnit && (
        <Card>
          <CardHeader>
            <CardTitle>Struktur KPI</CardTitle>
            <CardDescription>
              Kategori (P1, P2, P3) dan indikator-indikatornya
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
