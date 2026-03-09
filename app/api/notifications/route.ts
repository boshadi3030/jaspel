import { NextRequest, NextResponse } from 'next/server'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/lib/services/notification.service'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (unreadOnly) {
      const { count, error } = await getUnreadCount(user.id, supabase)

      if (error) {
        return NextResponse.json({ count: 0 })
      }

      return NextResponse.json({ count })
    }

    const { data, error } = await getNotifications(user.id, supabase)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    // Return empty data instead of 500 to prevent sidebar errors
    return NextResponse.json({ count: 0 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAll } = body

    if (markAll) {
      const { success, error } = await markAllAsRead(user.id, supabase)

      if (!success) {
        return NextResponse.json({ error }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (notificationId) {
      const { success, error } = await markAsRead(notificationId, supabase)

      if (!success) {
        return NextResponse.json({ error }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
