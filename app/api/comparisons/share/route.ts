import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { comparison_id } = await req.json()
    if (!comparison_id) return NextResponse.json({ error: 'Missing comparison_id' }, { status: 400 })

    const db = getServiceClient()
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    // Check if share token already exists
    const { data: existing } = await db
      .from('comparison_shares')
      .select('share_token')
      .eq('comparison_id', comparison_id)
      .maybeSingle()

    if (existing?.share_token) {
      return NextResponse.json({ ok: true, shareToken: existing.share_token })
    }

    // Create new share token
    const shareToken = uuidv4().replace(/-/g, '').slice(0, 16)
    const { error } = await db.from('comparison_shares').insert({
      comparison_id,
      share_token: shareToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    })

    if (error) {
      console.error('Share token creation error:', error)
      // Fallback: use comparison_id as share token directly
      return NextResponse.json({ ok: true, shareToken: comparison_id })
    }

    return NextResponse.json({ ok: true, shareToken })
  } catch (e) {
    console.error('POST /api/comparisons/share error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// Resolve share token to comparison data
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const db = getServiceClient()
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    // Try comparison_shares table first
    const { data: share } = await db
      .from('comparison_shares')
      .select('comparison_id, expires_at')
      .eq('share_token', token)
      .maybeSingle()

    let comparisonId = share?.comparison_id

    // Check expiry
    if (share?.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link expired' }, { status: 410 })
    }

    // Fallback: token might be the comparison_id itself
    if (!comparisonId) comparisonId = token

    // Load comparison + offers
    const [compRes, offersRes] = await Promise.all([
      db.from('comparisons').select('*').eq('id', comparisonId).single(),
      db.from('offers').select('*').eq('comparison_id', comparisonId).order('created_at', { ascending: true }),
    ])

    if (compRes.error) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      ok: true,
      comparison: compRes.data,
      offers: offersRes.data ?? [],
    })
  } catch (e) {
    console.error('GET /api/comparisons/share error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
