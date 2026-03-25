import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId, email, companyName } = await req.json()
    if (!userId || !email || !companyName) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    const db = getServiceClient()
    if (!db) {
      return NextResponse.json({ ok: false, error: 'DB not configured' }, { status: 500 })
    }

    // Try to create in broker_accounts + broker_users (user's actual schema)
    let accountId: string | null = null

    // 1. Create broker_accounts record
    const { data: account, error: accErr } = await db
      .from('broker_accounts')
      .insert({
        company_name: companyName,
        email,
        created_by: userId,
      })
      .select('id')
      .single()

    if (!accErr && account) {
      accountId = account.id
    }

    // 2. Create broker_users record (link user to account)
    if (accountId) {
      await db.from('broker_users').insert({
        user_id: userId,
        account_id: accountId,
        role: 'broker_admin',
        email,
      })
    }

    // 3. Also try broker_profiles (fallback table)
    try {
      await db.from('broker_profiles').upsert({
        id: userId,
        company_name: companyName,
        email,
      })
    } catch { /* table may not exist */ }

    return NextResponse.json({ ok: true, accountId })
  } catch (e) {
    console.error('[api/auth/register] Error:', e)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
