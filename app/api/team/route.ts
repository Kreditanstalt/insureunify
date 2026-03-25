import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/apiAuth'

export const dynamic = 'force-dynamic'

// List team members for the current user's account
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.userId || !auth.accountId) {
      return NextResponse.json({ members: [] })
    }

    const db = getServiceClient()
    if (!db) return NextResponse.json({ members: [] })

    const { data, error } = await db
      .from('broker_users')
      .select('id, email, role, created_at')
      .eq('account_id', auth.accountId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('GET /api/team error:', error)
      return NextResponse.json({ members: [] })
    }

    return NextResponse.json({ members: data ?? [] })
  } catch (e) {
    console.error('GET /api/team error:', e)
    return NextResponse.json({ members: [] })
  }
}

// Invite a new team member
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.userId || !auth.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getServiceClient()
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    // Check if current user is admin
    const { data: currentUser } = await db
      .from('broker_users')
      .select('role')
      .eq('id', auth.userId)
      .eq('account_id', auth.accountId)
      .single()

    if (currentUser?.role !== 'broker_admin') {
      return NextResponse.json({ error: 'Нямате права за управление на екипа' }, { status: 403 })
    }

    const { email, role = 'broker' } = await req.json()
    if (!email) return NextResponse.json({ error: 'Липсва имейл' }, { status: 400 })

    // Check if already a member
    const { data: existing } = await db
      .from('broker_users')
      .select('id')
      .eq('account_id', auth.accountId)
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Този потребител вече е в екипа' }, { status: 409 })
    }

    // Create invitation record
    const { data: invited, error } = await db
      .from('broker_users')
      .insert({
        account_id: auth.accountId,
        email,
        role,
        // id will be auto-generated, linked to user when they register/login
      })
      .select()
      .single()

    if (error) {
      console.error('Invite error:', error)
      return NextResponse.json({ error: 'Грешка при покана' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, member: invited })
  } catch (e) {
    console.error('POST /api/team error:', e)
    return NextResponse.json({ error: 'Грешка' }, { status: 500 })
  }
}

// Update role or remove member
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.userId || !auth.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getServiceClient()
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    // Check admin permission
    const { data: currentUser } = await db
      .from('broker_users')
      .select('role')
      .eq('id', auth.userId)
      .eq('account_id', auth.accountId)
      .single()

    if (currentUser?.role !== 'broker_admin') {
      return NextResponse.json({ error: 'Нямате права' }, { status: 403 })
    }

    const { memberId, role, action } = await req.json()

    if (action === 'remove') {
      await db.from('broker_users').delete().eq('id', memberId).eq('account_id', auth.accountId)
      return NextResponse.json({ ok: true })
    }

    if (role) {
      await db.from('broker_users').update({ role }).eq('id', memberId).eq('account_id', auth.accountId)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Невалидно действие' }, { status: 400 })
  } catch (e) {
    console.error('PATCH /api/team error:', e)
    return NextResponse.json({ error: 'Грешка' }, { status: 500 })
  }
}
