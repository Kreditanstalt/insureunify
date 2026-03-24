import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient()
    if (!db) return NextResponse.json({ comparisons: [] })

    const submissionId = req.nextUrl.searchParams.get('submission_id')
    const id = req.nextUrl.searchParams.get('id')

    if (id) {
      const { data, error } = await db
        .from('offer_comparisons')
        .select('*')
        .eq('id', id)
        .single()
      if (error) return NextResponse.json({ comparisons: [] })
      return NextResponse.json({ comparisons: data ? [data] : [] })
    }

    let query = db
      .from('offer_comparisons')
      .select('*')
      .order('created_at', { ascending: false })

    if (submissionId) {
      query = query.eq('submission_id', submissionId)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ comparisons: [] })
    return NextResponse.json({ comparisons: data })
  } catch {
    return NextResponse.json({ comparisons: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = getServiceClient()

    const row = {
      submission_id: body.submission_id || null,
      client_name: body.client_name ?? '',
      insurance_class: body.insurance_class ?? '',
      status: 'draft',
    }

    if (!db) {
      // Return a fake ID for offline mode
      return NextResponse.json({ ok: true, comparison: { id: crypto.randomUUID(), ...row, created_at: new Date().toISOString() } })
    }

    const { data, error } = await db
      .from('offer_comparisons')
      .insert(row)
      .select()
      .single()

    if (error) {
      console.error('Comparison create error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, comparison: data })
  } catch (e) {
    console.error('POST /api/comparisons error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false }, { status: 400 })

    const body = await req.json()
    const db = getServiceClient()
    if (!db) return NextResponse.json({ ok: true })

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.status !== undefined) update.status = body.status
    if (body.notes !== undefined) update.notes = body.notes

    const { data, error } = await db
      .from('offer_comparisons')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Comparison update error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, comparison: data })
  } catch (e) {
    console.error('PATCH /api/comparisons error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
