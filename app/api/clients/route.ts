import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'

export async function GET() {
  const db = getServiceClient()
  if (!db) return NextResponse.json({ clients: [] })

  const { data, error } = await db
    .from('clients')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clients: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = getServiceClient()
  if (!db) return NextResponse.json({ ok: true })

  const { error } = await db.from('clients').upsert(
    { ...body, tags: body.tags ?? [] },
    { onConflict: 'id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const db = getServiceClient()
  if (!db) return NextResponse.json({ ok: true })

  const { error } = await db.from('clients').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
