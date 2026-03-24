import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = getServiceClient()
    if (!db) return NextResponse.json({ ok: true, id: body.id })

    const row: Record<string, unknown> = {
      id:                body.id,
      client_name:       body.clientName,
      insurance_class:   body.insuranceClass,
      selected_insurers: body.selectedInsurers ?? [],
      form_data:         body.formData ?? {},
      created_at:        body.createdAt ?? new Date().toISOString(),
    }
    if (body.renewedFromId) row.renewed_from_id = body.renewedFromId

    const { error } = await db.from('submissions').upsert(row, { onConflict: 'id' })

    if (error) console.error('Submission save error:', error)
    return NextResponse.json({ ok: true, id: body.id })
  } catch (e) {
    console.error('POST /api/submissions error:', e)
    return NextResponse.json({ ok: true })
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient()
    const id = req.nextUrl.searchParams.get('id')

    if (!db) return NextResponse.json(id ? { submission: null } : { submissions: [] })

    if (id) {
      const { data, error } = await db
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()
      if (error) return NextResponse.json({ submission: null })
      return NextResponse.json({ submission: data })
    }

    const { data, error } = await db
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ submissions: [] })
    return NextResponse.json({ submissions: data })
  } catch (e) {
    console.error('GET /api/submissions error:', e)
    return NextResponse.json({ submissions: [] })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const db = getServiceClient()
    if (!db) return NextResponse.json({ ok: true })
    await db.from('submissions').delete().eq('id', id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
