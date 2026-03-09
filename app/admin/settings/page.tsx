'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Receipt, Calculator, Mail, Clock, Save, Loader2 } from 'lucide-react'
import { useSettings } from '@/lib/contexts/settings-context'

interface LocalSettings {
  appName: string
  companyName: string
  companyAddress: string
  companyLogo: string
  footer: string
  taxRates: Record<string, number>
  minScore: number
  maxScore: number
  emailTemplates: Record<string, string>
  sessionTimeout: number
}

export default function SettingsPage() {
  // Use Settings Context
  const { settings: contextSettings, loading: contextLoading, error: contextError, updateSettings: updateContextSettings } = useSettings()
  
  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    appName: 'JASPEL',
    companyName: 'JASPEL Enterprise',
    companyAddress: 'Jakarta, Indonesia',
    companyLogo: '',
    footer: '(c) 2026 JASPEL Enterprise - All Rights Reserved',
    taxRates: {
      TK0: 5,
      K0: 5,
      K1: 15,
      K2: 25,
      K3: 30,
    },
    minScore: 0,
    maxScore: 100,
    emailTemplates: {
      poolApproval: 'Pool for period {{period}} has been approved.',
      calculationComplete: 'Calculation for period {{period}} is complete.',
      passwordReset: 'Your password has been reset.',
      newUser: 'Welcome! Your temporary password is {{password}}.',
    },
    sessionTimeout: 8,
  })
  
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Sync context settings to local state
  useEffect(() => {
    if (contextSettings) {
      setLocalSettings({
        appName: contextSettings.companyInfo?.appName || 'JASPEL',
        companyName: contextSettings.companyInfo?.name || 'JASPEL Enterprise',
        companyAddress: contextSettings.companyInfo?.address || 'Jakarta, Indonesia',
        companyLogo: contextSettings.companyInfo?.logo || '',
        footer: contextSettings.footer?.text || '(c) 2026 JASPEL Enterprise - All Rights Reserved',
        taxRates: contextSettings.taxRates || { TK0: 5, K0: 5, K1: 15, K2: 25, K3: 30 },
        minScore: contextSettings.calculationParams?.minScore || 0,
        maxScore: contextSettings.calculationParams?.maxScore || 100,
        emailTemplates: contextSettings.emailTemplates || {
          poolApproval: 'Pool for period {{period}} has been approved.',
          calculationComplete: 'Calculation for period {{period}} is complete.',
          passwordReset: 'Your password has been reset.',
          newUser: 'Welcome! Your temporary password is {{password}}.',
        },
        sessionTimeout: contextSettings.sessionTimeout?.hours || 8,
      })
    }
  }, [contextSettings])
  
  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    
    // Validate tax rates
    const taxStatuses = ['TK0', 'K0', 'K1', 'K2', 'K3']
    for (const status of taxStatuses) {
      const rate = localSettings.taxRates[status]
      if (rate < 0 || rate > 50) {
        setError(`Tarif pajak untuk ${status} harus antara 0% dan 50%`)
        setSaving(false)
        return
      }
    }
    
    // Validate calculation parameters
    if (localSettings.minScore >= localSettings.maxScore) {
      setError('Skor minimum harus lebih kecil dari skor maksimum')
      setSaving(false)
      return
    }
    
    // Validate session timeout
    if (localSettings.sessionTimeout < 1 || localSettings.sessionTimeout > 24) {
      setError('Batas waktu sesi harus antara 1 dan 24 jam')
      setSaving(false)
      return
    }
    
    try {
      // Use context update method for real-time updates
      const result = await updateContextSettings({
        companyInfo: {
          appName: localSettings.appName,
          name: localSettings.companyName,
          address: localSettings.companyAddress,
          logo: localSettings.companyLogo,
        },
        footer: {
          text: localSettings.footer,
        },
        taxRates: localSettings.taxRates,
        calculationParams: {
          minScore: localSettings.minScore,
          maxScore: localSettings.maxScore,
        },
        sessionTimeout: {
          hours: localSettings.sessionTimeout,
        },
        emailTemplates: localSettings.emailTemplates,
      })
      
      if (result.success) {
        setSuccess('Pengaturan berhasil disimpan! Perubahan akan diterapkan segera.')
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Gagal menyimpan pengaturan')
      }
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Gagal menyimpan pengaturan')
    }
    
    setSaving(false)
  }
  
  return (
    <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Aplikasi</h1>
          <p className="text-gray-500">Konfigurasi pengaturan dan parameter sistem</p>
        </div>
        
        {/* Context Error */}
        {contextError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {contextError}
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {success}
          </div>
        )}
        
        {/* Validation Error */}
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {contextLoading && !contextSettings ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Memuat pengaturan...</span>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informasi Perusahaan
                  </CardTitle>
                  <CardDescription>Perbarui detail perusahaan untuk laporan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="appName">Nama Aplikasi</Label>
                    <Input
                      id="appName"
                      value={localSettings.appName}
                      onChange={(e) => setLocalSettings({ ...localSettings, appName: e.target.value })}
                      placeholder="JASPEL"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Nama Perusahaan</Label>
                    <Input
                      id="companyName"
                      value={localSettings.companyName}
                      onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyAddress">Alamat</Label>
                    <Textarea
                      id="companyAddress"
                      value={localSettings.companyAddress}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalSettings({ ...localSettings, companyAddress: e.target.value })}
                      rows={3}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyLogo">URL Logo</Label>
                    <Input
                      id="companyLogo"
                      value={localSettings.companyLogo}
                      onChange={(e) => setLocalSettings({ ...localSettings, companyLogo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="footer">Teks Footer</Label>
                    <Input
                      id="footer"
                      value={localSettings.footer}
                      onChange={(e) => setLocalSettings({ ...localSettings, footer: e.target.value })}
                      placeholder="(c) 2026 JASPEL Enterprise - All Rights Reserved"
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>
          
              {/* Tax Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Konfigurasi Pajak
                  </CardTitle>
                  <CardDescription>Atur tarif pajak berdasarkan status (0-50%)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(localSettings.taxRates).map(([status, rate]) => (
                    <div key={status}>
                      <Label htmlFor={`tax-${status}`}>{status}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`tax-${status}`}
                          type="number"
                          min="0"
                          max="50"
                          step="0.1"
                          value={rate}
                          onChange={(e) => setLocalSettings({
                            ...localSettings,
                            taxRates: { ...localSettings.taxRates, [status]: parseFloat(e.target.value) }
                          })}
                          disabled={saving}
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {/* Calculation Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Parameter Perhitungan
                  </CardTitle>
                  <CardDescription>Atur rentang skor untuk perhitungan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="minScore">Skor Minimum</Label>
                    <Input
                      id="minScore"
                      type="number"
                      value={localSettings.minScore}
                      onChange={(e) => setLocalSettings({ ...localSettings, minScore: parseFloat(e.target.value) })}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxScore">Skor Maksimum</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      value={localSettings.maxScore}
                      onChange={(e) => setLocalSettings({ ...localSettings, maxScore: parseFloat(e.target.value) })}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Session Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pengaturan Sesi
                  </CardTitle>
                  <CardDescription>Konfigurasi batas waktu sesi (1-24 jam)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Batas Waktu Sesi (jam)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="1"
                      max="24"
                      value={localSettings.sessionTimeout}
                      onChange={(e) => setLocalSettings({ ...localSettings, sessionTimeout: parseInt(e.target.value) })}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
        
            {/* Email Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Template Email
                </CardTitle>
                <CardDescription>Sesuaikan template notifikasi email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="poolApproval">Persetujuan Pool</Label>
                  <Textarea
                    id="poolApproval"
                    value={localSettings.emailTemplates.poolApproval}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalSettings({
                      ...localSettings,
                      emailTemplates: { ...localSettings.emailTemplates, poolApproval: e.target.value }
                    })}
                    rows={2}
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="calculationComplete">Perhitungan Selesai</Label>
                  <Textarea
                    id="calculationComplete"
                    value={localSettings.emailTemplates.calculationComplete}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalSettings({
                      ...localSettings,
                      emailTemplates: { ...localSettings.emailTemplates, calculationComplete: e.target.value }
                    })}
                    rows={2}
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordReset">Reset Password</Label>
                  <Textarea
                    id="passwordReset"
                    value={localSettings.emailTemplates.passwordReset}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalSettings({
                      ...localSettings,
                      emailTemplates: { ...localSettings.emailTemplates, passwordReset: e.target.value }
                    })}
                    rows={2}
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="newUser">Selamat Datang Pengguna Baru</Label>
                  <Textarea
                    id="newUser"
                    value={localSettings.emailTemplates.newUser}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalSettings({
                      ...localSettings,
                      emailTemplates: { ...localSettings.emailTemplates, newUser: e.target.value }
                    })}
                    rows={2}
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving || contextLoading}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Pengaturan
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
  )
}
