'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Save, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface Settings {
  organization_name: string
  organization_address: string
  organization_phone: string
  organization_email: string
  logo_url: string | null
  footer_text: string
  tax_rates: {
    'TK/0': number
    'TK/1': number
    'TK/2': number
    'TK/3': number
    'K/0': number
    'K/1': number
    'K/2': number
    'K/3': number
  }
  calculation_params: {
    minScore: number
    maxScore: number
  }
  session_timeout: {
    hours: number
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    organization_name: '',
    organization_address: '',
    organization_phone: '',
    organization_email: '',
    logo_url: null,
    footer_text: '',
    tax_rates: {
      'TK/0': 5,
      'TK/1': 5,
      'TK/2': 15,
      'TK/3': 15,
      'K/0': 5,
      'K/1': 15,
      'K/2': 25,
      'K/3': 30
    },
    calculation_params: {
      minScore: 0,
      maxScore: 100
    },
    session_timeout: {
      hours: 8
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('t_settings')
        .select('key, value')

      if (error) {
        console.error('Error loading settings:', error)
        throw error
      }

      const settingsMap: any = {}
      data?.forEach(item => {
        settingsMap[item.key] = item.value
      })

      // Extract company info
      const orgSettings = settingsMap.company_info || {}
      const footerSettings = settingsMap.footer || {}
      const taxRates = settingsMap.tax_rates || {}
      const calcParams = settingsMap.calculation_params || {}
      const sessionTimeout = settingsMap.session_timeout || {}
      
      setSettings({
        organization_name: orgSettings.name || '',
        organization_address: orgSettings.address || '',
        organization_phone: orgSettings.phone || '',
        organization_email: orgSettings.email || '',
        logo_url: orgSettings.logo || null,
        footer_text: typeof footerSettings === 'string' ? footerSettings : (footerSettings.text || ''),
        tax_rates: {
          'TK/0': taxRates['TK0'] || taxRates['TK/0'] || 5,
          'TK/1': taxRates['TK1'] || taxRates['TK/1'] || 5,
          'TK/2': taxRates['TK2'] || taxRates['TK/2'] || 15,
          'TK/3': taxRates['TK3'] || taxRates['TK/3'] || 15,
          'K/0': taxRates['K0'] || taxRates['K/0'] || 5,
          'K/1': taxRates['K1'] || taxRates['K/1'] || 15,
          'K/2': taxRates['K2'] || taxRates['K/2'] || 25,
          'K/3': taxRates['K3'] || taxRates['K/3'] || 30
        },
        calculation_params: {
          minScore: calcParams.minScore ?? 0,
          maxScore: calcParams.maxScore ?? 100
        },
        session_timeout: {
          hours: sessionTimeout.hours ?? 8
        }
      })

      if (orgSettings.logo) {
        setLogoPreview(orgSettings.logo)
      }
    } catch (error: any) {
      console.error('Error loading settings:', error)
      toast.error('Gagal memuat pengaturan: ' + (error.message || 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 2MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar')
        return
      }

      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return settings.logo_url

    try {
      const supabase = createClient()
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      toast.error(`Gagal mengunggah logo: ${error.message || 'Unknown error'}`)
      return null
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let logoUrl = settings.logo_url

      if (logoFile) {
        const uploadedUrl = await uploadLogo()
        if (uploadedUrl) {
          logoUrl = uploadedUrl
        } else {
          setIsSaving(false)
          return
        }
      }

      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Prepare company_info object
      const companyInfo = {
        appName: 'JASPEL',
        name: settings.organization_name,
        address: settings.organization_address,
        phone: settings.organization_phone,
        email: settings.organization_email,
        logo: logoUrl || ''
      }

      // Upsert company_info
      const { error: companyError } = await supabase
        .from('t_settings')
        .upsert({ 
          key: 'company_info', 
          value: companyInfo,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (companyError) {
        console.error('Company info error:', companyError)
        throw companyError
      }

      // Upsert footer
      const footerData = {
        text: settings.footer_text
      }
      
      const { error: footerError } = await supabase
        .from('t_settings')
        .upsert({ 
          key: 'footer', 
          value: footerData,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (footerError) {
        console.error('Footer error:', footerError)
        throw footerError
      }

      // Upsert tax rates (convert keys to match database format)
      const taxRatesData: Record<string, number> = {
        'TK0': settings.tax_rates['TK/0'],
        'K0': settings.tax_rates['K/0'],
        'K1': settings.tax_rates['K/1'],
        'K2': settings.tax_rates['K/2'],
        'K3': settings.tax_rates['K/3']
      }

      const { error: taxError } = await supabase
        .from('t_settings')
        .upsert({ 
          key: 'tax_rates', 
          value: taxRatesData,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (taxError) {
        console.error('Tax rates error:', taxError)
        throw taxError
      }

      // Upsert calculation params
      const { error: calcError } = await supabase
        .from('t_settings')
        .upsert({ 
          key: 'calculation_params', 
          value: settings.calculation_params,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (calcError) {
        console.error('Calculation params error:', calcError)
        throw calcError
      }

      // Upsert session timeout
      const { error: sessionError } = await supabase
        .from('t_settings')
        .upsert({ 
          key: 'session_timeout', 
          value: settings.session_timeout,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (sessionError) {
        console.error('Session timeout error:', sessionError)
        throw sessionError
      }

      toast.success('Pengaturan berhasil disimpan')
      setLogoFile(null)
      await loadSettings()
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(`Gagal menyimpan pengaturan: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Sistem</h1>
        <p className="text-gray-600 mt-1">Kelola informasi organisasi dan pengaturan aplikasi</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Organisasi</CardTitle>
            <CardDescription>Data organisasi yang akan ditampilkan di aplikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization_name">Nama Organisasi</Label>
              <Input
                id="organization_name"
                value={settings.organization_name}
                onChange={(e) => setSettings({ ...settings, organization_name: e.target.value })}
                placeholder="Masukkan nama organisasi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_address">Alamat</Label>
              <Textarea
                id="organization_address"
                value={settings.organization_address}
                onChange={(e) => setSettings({ ...settings, organization_address: e.target.value })}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_phone">Telepon</Label>
              <Input
                id="organization_phone"
                value={settings.organization_phone}
                onChange={(e) => setSettings({ ...settings, organization_phone: e.target.value })}
                placeholder="Masukkan nomor telepon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_email">Email</Label>
              <Input
                id="organization_email"
                type="email"
                value={settings.organization_email}
                onChange={(e) => setSettings({ ...settings, organization_email: e.target.value })}
                placeholder="Masukkan email"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo Organisasi</CardTitle>
            <CardDescription>Upload logo yang akan ditampilkan di aplikasi (Maks. 2MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo Saat Ini</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="max-h-32 mx-auto object-contain"
                  />
                ) : (
                  <div className="text-gray-400">
                    <ImageIcon className="h-16 w-16 mx-auto mb-2" />
                    <p>Belum ada logo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Upload Logo Baru</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('logo')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500">Format: JPG, PNG, SVG (Maks. 2MB)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teks Footer</CardTitle>
          <CardDescription>Teks yang akan ditampilkan di bagian bawah aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer_text">Footer</Label>
            <Textarea
              id="footer_text"
              value={settings.footer_text}
              onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
              placeholder="Masukkan teks footer"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Konfigurasi Pajak PPh 21</CardTitle>
            <CardDescription>Persentase pajak berdasarkan status PTKP (dalam %)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_tk0">TK/0 (Tidak Kawin, 0 Tanggungan)</Label>
                <Input
                  id="tax_tk0"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={settings.tax_rates['TK/0']}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    tax_rates: { ...settings.tax_rates, 'TK/0': parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_k0">K/0 (Kawin, 0 Tanggungan)</Label>
                <Input
                  id="tax_k0"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={settings.tax_rates['K/0']}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    tax_rates: { ...settings.tax_rates, 'K/0': parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_k1">K/1 (Kawin, 1 Tanggungan)</Label>
                <Input
                  id="tax_k1"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={settings.tax_rates['K/1']}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    tax_rates: { ...settings.tax_rates, 'K/1': parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_k2">K/2 (Kawin, 2 Tanggungan)</Label>
                <Input
                  id="tax_k2"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={settings.tax_rates['K/2']}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    tax_rates: { ...settings.tax_rates, 'K/2': parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_k3">K/3 (Kawin, 3 Tanggungan)</Label>
                <Input
                  id="tax_k3"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={settings.tax_rates['K/3']}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    tax_rates: { ...settings.tax_rates, 'K/3': parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parameter Perhitungan</CardTitle>
            <CardDescription>Konfigurasi parameter untuk perhitungan KPI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min_score">Skor Minimum</Label>
              <Input
                id="min_score"
                type="number"
                min="0"
                value={settings.calculation_params.minScore}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  calculation_params: { 
                    ...settings.calculation_params, 
                    minScore: parseFloat(e.target.value) || 0 
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_score">Skor Maksimum</Label>
              <Input
                id="max_score"
                type="number"
                min="0"
                value={settings.calculation_params.maxScore}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  calculation_params: { 
                    ...settings.calculation_params, 
                    maxScore: parseFloat(e.target.value) || 0 
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session_timeout">Timeout Sesi (Jam)</Label>
              <Input
                id="session_timeout"
                type="number"
                min="1"
                max="24"
                value={settings.session_timeout.hours}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  session_timeout: { 
                    hours: parseInt(e.target.value) || 8 
                  }
                })}
              />
              <p className="text-sm text-gray-500">Durasi sesi login sebelum otomatis logout (1-24 jam)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </div>
  )
}
