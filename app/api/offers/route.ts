import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient()
    const comparisonId = req.nextUrl.searchParams.get('comparison_id')
    if (!db) return NextResponse.json({ offers: [] })

    if (!comparisonId) {
      return NextResponse.json({ offers: [] })
    }

    const { data, error } = await db
      .from('offers')
      .select('*')
      .eq('comparison_id', comparisonId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ offers: [] })
    return NextResponse.json({ offers: data })
  } catch {
    return NextResponse.json({ offers: [] })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false }, { status: 400 })

    const db = getServiceClient()
    if (!db) return NextResponse.json({ ok: true })

    // Delete file from storage first
    const { data: offer } = await db.from('offers').select('file_url').eq('id', id).single()
    if (offer?.file_url) {
      await db.storage.from('offers').remove([offer.file_url])
    }

    await db.from('offers').delete().eq('id', id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
