import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get session without triggering refresh
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // If no session or session error, redirect to login
    if (!session || sessionError) {
      if (request.nextUrl.pathname !== '/login') {
        const loginUrl = new URL('/login', request.url)
        
        // Clear all auth cookies on redirect
        const cookiesToClear = [
          'sb-access-token',
          'sb-refresh-token',
          'supabase-auth-token',
          'sb-auth-token'
        ]
        
        const redirectResponse = NextResponse.redirect(loginUrl)
        cookiesToClear.forEach(cookieName => {
          redirectResponse.cookies.set(cookieName, '', {
            maxAge: 0,
            path: '/',
          })
        })
        
        return redirectResponse
      }
      return response
    }

    // Verify employee exists and is active
    const { data: employee, error: employeeError } = await supabase
      .from('m_employees')
      .select('is_active')
      .eq('user_id', session.user.id)
      .maybeSingle()
    
    if (employeeError) {
      console.error('Employee fetch error:', employeeError)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'user_not_found')
      
      // Clear cookies on error
      const redirectResponse = NextResponse.redirect(loginUrl)
      const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token', 'sb-auth-token']
      cookiesToClear.forEach(cookieName => {
        redirectResponse.cookies.set(cookieName, '', { maxAge: 0, path: '/' })
      })
      
      return redirectResponse
    }
    
    if (!employee) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'user_not_found')
      
      // Clear cookies when employee not found
      const redirectResponse = NextResponse.redirect(loginUrl)
      const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token', 'sb-auth-token']
      cookiesToClear.forEach(cookieName => {
        redirectResponse.cookies.set(cookieName, '', { maxAge: 0, path: '/' })
      })
      
      return redirectResponse
    }
    
    if (!employee.is_active) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'inactive')
      
      // Clear cookies when employee inactive
      const redirectResponse = NextResponse.redirect(loginUrl)
      const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token', 'sb-auth-token']
      cookiesToClear.forEach(cookieName => {
        redirectResponse.cookies.set(cookieName, '', { maxAge: 0, path: '/' })
      })
      
      return redirectResponse
    }
    
    // Set security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // On any error, redirect to login and clear cookies
    const loginUrl = new URL('/login', request.url)
    const redirectResponse = NextResponse.redirect(loginUrl)
    const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token', 'sb-auth-token']
    cookiesToClear.forEach(cookieName => {
      redirectResponse.cookies.set(cookieName, '', { maxAge: 0, path: '/' })
    })
    
    return redirectResponse
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/manager/:path*',
    '/employee/:path*',
    '/profile/:path*',
    '/notifications/:path*',
  ],
}
