/**
 * apiAuth.ts — Validate Supabase session in API routes.
 *
 * Usage in route handlers:
 *   const auth = await getAuthFromRequest(req)
 *   if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *   // auth.userId and auth.accountId are safe to use
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

interface AuthResult {
  user: { id: string; email: string } | null
  userId: string | null
  accountId: string | null
}

export async function getAuthFromRequest(req: NextRequest): Promise<AuthResult> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          setAll(_cookiesToSet) {
            // API routes don't need to set cookies
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { user: null, userId: null, accountId: null }

    // Get account_id from broker_users (using service client to bypass RLS)
    let accountId: string | null = null
    try {
      const { getServiceClient } = await import('./db')
      const db = getServiceClient()
      if (db) {
        const { data: bu } = await db
          .from('broker_users')
          .select('account_id')
          .eq('id', user.id)
          .maybeSingle()
        accountId = bu?.account_id ?? null
      }
    } catch { /* non-critical */ }

    return {
      user: { id: user.id, email: user.email ?? '' },
      userId: user.id,
      accountId,
    }
  } catch {
    return { user: null, userId: null, accountId: null }
  }
}
