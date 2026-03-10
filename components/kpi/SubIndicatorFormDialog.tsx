'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface KPIIndicator {
    id: string
    code: string
    name: string
}

interface KPISubIndicator {
    id: string
    indicator_id: string
    code: string
    name: string
    target_value: number
    weight_percentage: number
    score_1: number
    score_2: number
    score_3: number
    score_4: number
    score_5: number
    score_1_label: string
    score_2_label: string
    score_3_label: string
    score_4_label: string
    score_5_label: string
    measurement_unit: string | null
    description: string | null
    is_active: boolean
}

interface SubIndicatorFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    subIndicator: KPISubIndicator | null
    indicator: KPIIndicator | null
    existingSubIndicators: KPISubIndicator[]
    onSuccess: () => void
}

export default function SubIndicatorFormDialog({
    open,
    onOpenChange,
    subIndicator,
    indicator,
    existingSubIndicators,
    onSuccess
}: SubIndicatorFormDialogProps) {
    const supabase = createClient()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        target_value: '100.00',
        weight_percentage: '',
        score_1: '20',
        score_2: '40',
        score_3: '60',
        score_4: '80',
        score_5: '100',
        score_1_label: 'Sangat Kurang',
        score_2_label: 'Kurang',
        score_3_label: 'Cukup',
        score_4_label: 'Baik',
        score_5_label: 'Sangat Baik',
        measurement_unit: '',
        description: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (subIndicator) {
            setFormData({
                code: subIndicator.code,
                name: subIndicator.name,
                target_value: subIndicator.target_value?.toString() || '100.00',
                weight_percentage: subIndicator.weight_percentage.toString(),
                score_1: subIndicator.score_1?.toString() || '20',
                score_2: subIndicator.score_2?.toString() || '40',
                score_3: subIndicator.score_3?.toString() || '60',
                score_4: subIndicator.score_4?.toString() || '80',
                score_5: subIndicator.score_5?.toString() || '100',
                score_1_label: subIndicator.score_1_label || 'Sangat Kurang',
                score_2_label: subIndicator.score_2_label || 'Kurang',
                score_3_label: subIndicator.score_3_label || 'Cukup',
                score_4_label: subIndicator.score_4_label || 'Baik',
                score_5_label: subIndicator.score_5_label || 'Sangat Baik',
                measurement_unit: subIndicator.measurement_unit || '',
                description: subIndicator.description || ''
            })
        } else {
            setFormData({
                code: '',
                name: '',
                target_value: '100.00',
                weight_percentage: '',
                score_1: '20',
                score_2: '40',
                score_3: '60',
                score_4: '80',
                score_5: '100',
                score_1_label: 'Sangat Kurang',
                score_2_label: 'Kurang',
                score_3_label: 'Cukup',
                score_4_label: 'Baik',
                score_5_label: 'Sangat Baik',
                measurement_unit: '',
                description: ''
            })
        }
        setErrors({})
    }, [subIndicator, open])

    function getTotalWeightInfo(): { total: number; isValid: boolean; message: string } {
        const weight = parseFloat(formData.weight_percentage) || 0
        const others = existingSubIndicators.filter(s => s.id !== subIndicator?.id)
        const otherWeightsSum = others.reduce((sum, s) => sum + Number(s.weight_percentage), 0)
        const totalWeight = otherWeightsSum + weight
        const isValid = Math.abs(totalWeight - 100) < 0.01

        return {
            total: totalWeight,
            isValid,
            message: isValid
                ? `Total bobot: ${totalWeight.toFixed(2)}% ✓`
                : `Total bobot: ${totalWeight.toFixed(2)}% (harus 100%)`
        }
    }

    function validateForm(): boolean {
        const newErrors: Record<string, string> = {}

        if (!formData.code.trim()) {
            newErrors.code = 'Kode sub indikator wajib diisi'
        } else if (!subIndicator) {
            const codeExists = existingSubIndicators.some(s => s.code === formData.code.trim())
            if (codeExists) {
                newErrors.code = 'Kode sub indikator sudah ada dalam indikator ini'
            }
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Nama sub indikator wajib diisi'
        }

        if (!formData.weight_percentage) {
            newErrors.weight_percentage = 'Persentase bobot wajib diisi'
        } else {
            const weight = parseFloat(formData.weight_percentage)
            if (isNaN(weight) || weight < 0 || weight > 100) {
                newErrors.weight_percentage = 'Bobot harus antara 0 dan 100'
            }
        }

        // Validate scores
        for (let i = 1; i <= 5; i++) {
            const scoreKey = `score_${i}` as keyof typeof formData
            const val = formData[scoreKey]
            if (val !== '' && val !== undefined) {
                const num = parseFloat(val)
                if (isNaN(num)) {
                    newErrors[scoreKey] = `Nilai skor ${i} harus berupa angka`
                }
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!validateForm()) return
        if (!indicator && !subIndicator) return

        setIsSubmitting(true)

        try {
            const data = {
                indicator_id: subIndicator?.indicator_id || indicator?.id,
                code: formData.code.trim(),
                name: formData.name.trim(),
                target_value: parseFloat(formData.target_value) || 100,
                weight_percentage: parseFloat(formData.weight_percentage),
                score_1: parseFloat(formData.score_1) || 0,
                score_2: parseFloat(formData.score_2) || 0,
                score_3: parseFloat(formData.score_3) || 0,
                score_4: parseFloat(formData.score_4) || 0,
                score_5: parseFloat(formData.score_5) || 0,
                score_1_label: formData.score_1_label.trim() || 'Sangat Kurang',
                score_2_label: formData.score_2_label.trim() || 'Kurang',
                score_3_label: formData.score_3_label.trim() || 'Cukup',
                score_4_label: formData.score_4_label.trim() || 'Baik',
                score_5_label: formData.score_5_label.trim() || 'Sangat Baik',
                measurement_unit: formData.measurement_unit.trim() || null,
                description: formData.description.trim() || null,
                is_active: true
            }

            if (subIndicator) {
                const { error } = await supabase
                    .from('m_kpi_sub_indicators')
                    .update(data)
                    .eq('id', subIndicator.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('m_kpi_sub_indicators')
                    .insert(data)

                if (error) throw error
            }

            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            console.error('Error saving sub indicator:', error)
            alert(error.message || 'Gagal menyimpan sub indikator')
        } finally {
            setIsSubmitting(false)
        }
    }

    const scoreColors = [
        'border-red-200 bg-red-50',
        'border-orange-200 bg-orange-50',
        'border-yellow-200 bg-yellow-50',
        'border-blue-200 bg-blue-50',
        'border-green-200 bg-green-50',
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{subIndicator ? 'Ubah Sub Indikator' : 'Tambah Sub Indikator'}</DialogTitle>
                        <DialogDescription>
                            {subIndicator
                                ? 'Perbarui informasi sub indikator'
                                : `Buat sub indikator baru untuk ${indicator?.code} - ${indicator?.name}`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        {/* Code & Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sub_code">Kode Sub Indikator *</Label>
                                <Input
                                    id="sub_code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="contoh: SI-001"
                                    disabled={!!subIndicator}
                                />
                                {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sub_weight">Bobot (%) *</Label>
                                <Input
                                    id="sub_weight"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.weight_percentage}
                                    onChange={(e) => setFormData({ ...formData, weight_percentage: e.target.value })}
                                    placeholder="contoh: 25.00"
                                />
                                {errors.weight_percentage && <p className="text-sm text-red-600">{errors.weight_percentage}</p>}
                                {formData.weight_percentage && !errors.weight_percentage && (() => {
                                    const weightInfo = getTotalWeightInfo()
                                    return (
                                        <p className={`text-xs font-medium ${weightInfo.isValid ? 'text-green-600' : 'text-amber-600'}`}>
                                            {weightInfo.message}
                                        </p>
                                    )
                                })()}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sub_name">Nama Sub Indikator *</Label>
                            <Input
                                id="sub_name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="contoh: Ketepatan Waktu Pelayanan"
                            />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Target & Satuan Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sub_target">Nilai Target</Label>
                                <Input
                                    id="sub_target"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.target_value}
                                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                                    placeholder="100.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sub_unit">Satuan Pengukuran</Label>
                                <Input
                                    id="sub_unit"
                                    value={formData.measurement_unit}
                                    onChange={(e) => setFormData({ ...formData, measurement_unit: e.target.value })}
                                    placeholder="contoh: %, pasien, jam"
                                />
                            </div>
                        </div>

                        {/* Score Section */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Nilai Skor (1-5)</Label>
                            <p className="text-xs text-gray-500">
                                Tentukan nilai skor dan label untuk setiap tingkatan penilaian
                            </p>
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map((i) => {
                                    const scoreKey = `score_${i}` as keyof typeof formData
                                    const labelKey = `score_${i}_label` as keyof typeof formData
                                    return (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-3 p-2.5 rounded-lg border ${scoreColors[i - 1]}`}
                                        >
                                            <span className="font-bold text-sm w-12 text-center shrink-0">
                                                Skor {i}
                                            </span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData[scoreKey]}
                                                onChange={(e) => setFormData({ ...formData, [scoreKey]: e.target.value })}
                                                className="w-24 bg-white"
                                                placeholder="Nilai"
                                            />
                                            <Input
                                                value={formData[labelKey]}
                                                onChange={(e) => setFormData({ ...formData, [labelKey]: e.target.value })}
                                                className="flex-1 bg-white"
                                                placeholder="Label"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                            {[1, 2, 3, 4, 5].map(i => {
                                const key = `score_${i}`
                                return errors[key] ? (
                                    <p key={key} className="text-sm text-red-600">{errors[key]}</p>
                                ) : null
                            })}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="sub_description">Deskripsi</Label>
                            <textarea
                                id="sub_description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md min-h-[60px] text-sm"
                                placeholder="Deskripsi opsional"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : subIndicator ? 'Perbarui' : 'Buat'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
