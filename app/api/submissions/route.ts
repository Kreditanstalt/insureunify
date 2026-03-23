import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = getServiceClient()

  if (!db) {
    return NextResponse.json({ ok: true, id: body.id })
  }

  const { error } = await db.from('submissions').upsert({
    id:                body.id,
    client_name:       body.clientName,
    insurance_class:   body.insuranceClass,
    selected_insurers: body.selectedInsurers ?? [],
    form_data:         body.formData ?? {},
    created_at:        body.createdAt ?? new Date().toISOString(),
  }, { onConflict: 'id' })

  if (error) {
    console.error('Submission save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: body.id })
}

export async function GET(req: NextRequest) {
  const db = getServiceClient()
  const id = req.nextUrl.searchParams.get('id')

  if (!db) return NextResponse.json({ submissions: [] })

  if (id) {
    const { data, error } = await db
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json({ submission: data })
  }

  const { data, error } = await db
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ submissions: data })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const db = getServiceClient()
  if (!db) return NextResponse.json({ ok: true })

  const { error } = await db.from('submissions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
