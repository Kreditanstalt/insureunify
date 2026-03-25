import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value)
          })
          // Recreate response once to carry updated request cookies
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // getUser() validates the token server-side (more secure than getSession)
  const { data: { user } } = await supabase.auth.getUser()

  const path = req.nextUrl.pathname

  const isPublic =
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password') ||
    path.startsWith('/auth/callback') ||
    path.startsWith('/onboarding')

  // Not logged in → redirect to login (except public pages)
  if (!user && !isPublic) {
    const url = new URL('/login', req.url)
    const redirect = NextResponse.redirect(url)
    // Carry any refreshed cookies to the redirect response
    res.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value))
    return redirect
  }

  // Logged in → redirect away from login/register
  if (user && (path === '/login' || path === '/register')) {
    const redirect = NextResponse.redirect(new URL('/dashboard', req.url))
    res.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value))
    return redirect
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|fonts|logos|demo).*)'],
}
