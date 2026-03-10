import { createClient } from '@/lib/supabase/client'
import { logAudit } from './audit.service'

export interface Settings {
  companyInfo: {
    appName: string
    name: string
    address: string
    logo: string
  }
  footer?: {
    text: string
  }
  taxRates: Record<string, number>
  calculationParams: {
    minScore: number
    maxScore: number
  }
  sessionTimeout: {
    hours: number
  }
  emailTemplates: Record<string, string>
}

// Helper function to transform settings array to object
function transformSettingsData(data: any[]): Settings {
  const settings: any = {}
  data?.forEach((item) => {
    if (item.key === 'company_info') {
      settings.companyInfo = item.value
    } else if (item.key === 'footer') {
      settings.footer = item.value
    } else if (item.key === 'tax_rates') {
      settings.taxRates = item.value
    } else if (item.key === 'calculation_params') {
      settings.calculationParams = item.value
    } else if (item.key === 'session_timeout') {
      settings.sessionTimeout = item.value
    } else if (item.key === 'email_templates') {
      settings.emailTemplates = item.value
    }
  })
  return settings as Settings
}

// Client-side functions (use browser client only)
export async function getSettings(): Promise<{ data: Settings | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('t_settings')
    .select('key, value')
  
  if (error) {
    console.error('Failed to fetch settings:', error)
    return { data: null, error: error.message }
  }
  
  return { data: transformSettingsData(data), error: null }
}

export async function getSetting(key: string): Promise<{ data: any | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('t_settings')
    .select('value')
    .eq('key', key)
    .single()
  
  if (error) {
    console.error(`Failed to fetch setting ${key}:`, error)
    return { data: null, error: error.message }
  }
  
  return { data: data?.value, error: null }
}

export async function updateSetting(
  key: string,
  value: any,
  description?: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()
  
  // Get old value for audit log
  const { data: oldData } = await supabase
    .from('t_settings')
    .select('value')
    .eq('key', key)
    .single()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase
    .from('t_settings')
    .update({
      value,
      description,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq('key', key)
  
  if (error) {
    console.error(`Failed to update setting ${key}:`, error)
    return { success: false, error: error.message }
  }
  
  // Log to audit trail - pass supabase client
  await logAudit({
    table_name: 't_settings',
    operation: 'UPDATE',
    record_id: key,
    old_value: oldData?.value,
    new_value: value,
    details: `Updated setting: ${key}`,
  }, supabase)
  
  return { success: true, error: null }
}

export async function updateSettings(settings: Partial<Settings>): Promise<{ success: boolean; error: string | null }> {
  try {
    if (settings.companyInfo) {
      await updateSetting('company_info', settings.companyInfo, 'Company information for reports')
    }
    
    if (settings.footer) {
      await updateSetting('footer', settings.footer, 'Footer text configuration')
    }
    
    if (settings.taxRates) {
      // Validate tax rates
      const taxStatuses = ['TK0', 'K0', 'K1', 'K2', 'K3']
      for (const status of taxStatuses) {
        const rate = settings.taxRates[status]
        if (rate !== undefined && (rate < 0 || rate > 50)) {
          return { success: false, error: `Tax rate for ${status} must be between 0% and 50%` }
        }
      }
      await updateSetting('tax_rates', settings.taxRates, 'Tax rates by status (percentage)')
    }
    
    if (settings.calculationParams) {
      // Validate calculation parameters
      if (settings.calculationParams.minScore >= settings.calculationParams.maxScore) {
        return { success: false, error: 'Minimum score must be less than maximum score' }
      }
      await updateSetting('calculation_params', settings.calculationParams, 'Calculation parameters')
    }
    
    if (settings.sessionTimeout) {
      // Validate session timeout
      if (settings.sessionTimeout.hours < 1 || settings.sessionTimeout.hours > 24) {
        return { success: false, error: 'Session timeout must be between 1 and 24 hours' }
      }
      await updateSetting('session_timeout', settings.sessionTimeout, 'Session timeout in hours')
    }
    
    if (settings.emailTemplates) {
      await updateSetting('email_templates', settings.emailTemplates, 'Email notification templates')
    }
    
    return { success: true, error: null }
  } catch (error: any) {
    console.error('Failed to update settings:', error)
    return { success: false, error: error.message }
  }
}

export async function getTaxRate(taxStatus: string): Promise<number> {
  const { data } = await getSetting('tax_rates')
  return data?.[taxStatus] || 0
}

export async function getSessionTimeout(): Promise<number> {
  const { data } = await getSetting('session_timeout')
  return data?.hours || 8
}

export async function getCompanyInfo(): Promise<any> {
  const { data } = await getSetting('company_info')
  return data || { 
    appName: 'JASPEL',
    name: 'JASPEL Enterprise', 
    address: 'Jakarta, Indonesia',
    phone: '',
    email: '',
    logo: ''
  }
}
