import { NextRequest, NextResponse } from 'next/server'
import { getSettingsServer } from '@/lib/services/settings.server.service'
import { updateSettings } from '@/lib/services/settings.service'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await getSettingsServer()
    
    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json()
    
    const { success, error } = await updateSettings(settings)
    
    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
