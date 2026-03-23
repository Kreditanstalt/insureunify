import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'

export async function GET() {
  try {
    const db = getServiceClient()
    if (!db) return NextResponse.json({ clients: [] })

    const { data, error } = await db
      .from('clients')
      .select('*')
      .order('updated_at', { ascending: false })

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

    await db.from('clients').delete().eq('id', id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
