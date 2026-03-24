import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json()
    const db = getServiceClient()
    if (!db) return NextResponse.json({ ok: true })

    const update: Record<string, unknown> = {}
    if (body.extracted_data !== undefined) update.extracted_data = body.extracted_data
    if (body.is_recommended !== undefined) update.is_recommended = body.is_recommended
    if (body.manually_edited !== undefined) update.manually_edited = body.manually_edited
    if (body.insurer_name !== undefined) update.insurer_name = body.insurer_name

    const { data, error } = await db
      .from('offers')
      .update(update)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Offer update error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, offer: data })
  } catch (e) {
    console.error('PATCH /api/offers/[id] error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
