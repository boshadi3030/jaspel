'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Unit {
  id: string
  code: string
  name: string
  proportion_percentage: number
  is_active: boolean
}

interface UnitFormDialogProps {
  unit: Unit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnitFormDialog({ unit, open, onOpenChange }: UnitFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    proportion_percentage: '0',
  })
  
  useEffect(() => {
    if (unit) {
      setFormData({
        code: unit.code,
        name: unit.name,
        proportion_percentage: unit.proportion_percentage.toString(),
      })
    } else {
      setFormData({
        code: '',
        name: '',
        proportion_percentage: '0',
      })
    }
    setError(null)
  }, [unit, open])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      const proportion = parseFloat(formData.proportion_percentage)
      
      if (isNaN(proportion) || proportion < 0 || proportion > 100) {
        setError('Proporsi harus antara 0 dan 100')
        setLoading(false)
        return
      }
      
      if (unit) {
        // Update existing unit
        const { error: updateError } = await supabase
          .from('m_units')
          .update({
            code: formData.code,
            name: formData.name,
            proportion_percentage: proportion,
            updated_at: new Date().toISOString(),
          })
          .eq('id', unit.id)
        
        if (updateError) throw updateError
      } else {
        // Create new unit
        // First check if code already exists
        const { data: existing } = await supabase
          .from('m_units')
          .select('id')
          .eq('code', formData.code)
          .single()
        
        if (existing) {
          setError('Kode unit sudah ada')
          setLoading(false)
          return
        }
        
        const { error: insertError } = await supabase
          .from('m_units')
          .insert({
            code: formData.code,
            name: formData.name,
            proportion_percentage: proportion,
            is_active: true,
          })
        
        if (insertError) throw insertError
      }
      
      router.refresh()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{unit ? 'Ubah Unit' : 'Tambah Unit'}</DialogTitle>
          <DialogDescription>
            {unit ? 'Perbarui informasi unit' : 'Buat unit organisasi baru'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="code">Kode Unit *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                disabled={!!unit}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Unit *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proportion">Proporsi (%) *</Label>
              <Input
                id="proportion"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.proportion_percentage}
                onChange={(e) => setFormData({ ...formData, proportion_percentage: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                Jumlah semua proporsi unit aktif harus sama dengan 100%
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : unit ? 'Perbarui' : 'Buat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
