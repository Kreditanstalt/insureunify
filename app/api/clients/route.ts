import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient()
    if (!db) return NextResponse.json({ clients: [] })

    // Authenticate from session cookies, fall back to query param
    const auth = await getAuthFromRequest(req)
    const brokerId = auth.userId ?? req.nextUrl.searchParams.get('broker_id')

    let query = db.from('clients').select('*').order('updated_at', { ascending: false })
    if (brokerId) query = query.eq('broker_id', brokerId)

    const { data, error } = await query
    if (error) return NextResponse.json({ clients: [] })
    return NextResponse.json({ clients: data })
  } catch {
    return NextResponse.json({ clients: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = getServiceClient()
    if (!db) return NextResponse.json({ ok: true })

    // Inject authenticated broker_id if not provided
    const auth = await getAuthFromRequest(req)
    if (auth.userId && !body.broker_id) {
      body.broker_id = auth.userId
    }

    const { error } = await db.from('clients').upsert(
      { ...body, tags: body.tags ?? [] },
      { onConflict: 'id' }
    )
    if (error) return NextResponse.json({ ok: true })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const db = getServiceClient()
    if (!db) return NextResponse.json({ ok: true })

    // Validate ownership
    const auth = await getAuthFromRequest(req)
    if (auth.userId) {
      const { data: client } = await db.from('clients').select('broker_id').eq('id', id).maybeSingle()
      if (client && client.broker_id !== auth.userId) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 })
      }
    }

    await db.from('clients').delete().eq('id', id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
