import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient()
    if (!db) return NextResponse.json({ comparisons: [] })

    const submissionId = req.nextUrl.searchParams.get('submission_id')
    const id = req.nextUrl.searchParams.get('id')

    if (id) {
      const { data, error } = await db.from('offer_comparisons').select('*').eq('id', id).single()
      if (error) return NextResponse.json({ comparisons: [] })
      // Merge comparison_data into top level for frontend compat
      const merged = data ? { ...data, ...(data.comparison_data as Record<string, unknown> ?? {}) } : null
      return NextResponse.json({ comparisons: merged ? [merged] : [] })
    }

    let query = db.from('offer_comparisons').select('*').order('created_at', { ascending: false })
    if (submissionId) query = query.eq('submission_id', submissionId)

    const { data, error } = await query
    if (error) return NextResponse.json({ comparisons: [] })
    // Merge comparison_data into each item
    const merged = (data ?? []).map((c: Record<string, unknown>) => ({
      ...c,
      ...(c.comparison_data as Record<string, unknown> ?? {}),
    }))
    return NextResponse.json({ comparisons: merged })
  } catch {
    return NextResponse.json({ comparisons: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = getServiceClient()

    // Store client_name, insurance_class, status, notes in comparison_data JSONB
    const comparisonData = {
      client_name: body.client_name ?? '',
      insurance_class: body.insurance_class ?? '',
      status: body.status ?? 'draft',
      notes: body.notes ?? '',
    }

    const row: Record<string, unknown> = {
      submission_id: body.submission_id || null,
      comparison_data: comparisonData,
    }

    if (!db) {
      return NextResponse.json({ ok: true, comparison: { id: body.id ?? crypto.randomUUID(), ...comparisonData, created_at: new Date().toISOString() } })
    }

    // Try insert (let Supabase auto-generate ID)
    const { data, error } = await db
      .from('offer_comparisons')
      .insert(row)
      .select()
      .single()

    if (error) {
      console.error('Comparison create error:', error, 'row:', JSON.stringify(row))
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const merged = data ? { ...data, ...(data.comparison_data as Record<string, unknown> ?? {}) } : data
    return NextResponse.json({ ok: true, comparison: merged })
  } catch (e) {
    console.error('POST /api/comparisons error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false }, { status: 400 })

    const db = getServiceClient()
    if (!db) return NextResponse.json({ ok: true })

    await db.from('offers').delete().eq('comparison_id', id)
    await db.from('offer_comparisons').delete().eq('id', id)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/comparisons error:', e)
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

    // Read existing comparison_data, merge updates
    const { data: existing } = await db.from('offer_comparisons').select('comparison_data').eq('id', id).single()
    const existingData = (existing?.comparison_data as Record<string, unknown>) ?? {}
    const updatedData = { ...existingData }

    if (body.status !== undefined) updatedData.status = body.status
    if (body.notes !== undefined) updatedData.notes = body.notes
    if (body.client_name !== undefined) updatedData.client_name = body.client_name

    const { data, error } = await db
      .from('offer_comparisons')
      .update({ comparison_data: updatedData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Comparison update error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const merged = data ? { ...data, ...(data.comparison_data as Record<string, unknown> ?? {}) } : data
    return NextResponse.json({ ok: true, comparison: merged })
  } catch (e) {
    console.error('PATCH /api/comparisons error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
