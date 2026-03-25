import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import { checkSubmissionLimit, incrementUsage } from '@/lib/planLimits'
import { getAuthFromRequest } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = getServiceClient()
    if (!db) return NextResponse.json({ ok: true, id: body.id })

    // ── Authenticate: get user from session cookies ──
    const auth = await getAuthFromRequest(req)
    const brokerId = auth.userId ?? body.broker_id

    // ── Plan enforcement ──
    if (auth.accountId) {
      const check = await checkSubmissionLimit(auth.accountId, db)
      if (!check.allowed) {
        if (check.reason === 'trial_expired') {
          return NextResponse.json(
            { ok: false, error: 'Пробният период е изтекъл. Изберете план за да продължите.', code: 'TRIAL_EXPIRED' },
            { status: 403 }
          )
        }
        if (check.reason === 'limit_reached') {
          return NextResponse.json(
            { ok: false, error: `Достигнахте месечния лимит от ${check.max} заявки. Надградете плана си.`, code: 'LIMIT_REACHED' },
            { status: 403 }
          )
        }
      }
    }

    // ── Save submission ──
    const row: Record<string, unknown> = {
      id:                body.id,
      client_name:       body.clientName,
      insurance_class:   body.insuranceClass,
      selected_insurers: body.selectedInsurers ?? [],
      form_data:         body.formData ?? {},
      created_at:        body.createdAt ?? new Date().toISOString(),
    }
    if (body.renewedFromId) row.renewed_from_id = body.renewedFromId
    if (brokerId) row.broker_id = brokerId

    const { error } = await db.from('submissions').upsert(row, { onConflict: 'id' })
    if (error) console.error('Submission save error:', error)

    // ── Increment usage ──
    if (auth.accountId) {
      await incrementUsage(auth.accountId, db).catch((e) => console.error('Usage increment error:', e))
    }

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

    // Single submission by ID — no auth needed (used by review page with direct link)
    if (id) {
      const { data, error } = await db.from('submissions').select('*').eq('id', id).single()
      if (error) return NextResponse.json({ submission: null })
      return NextResponse.json({ submission: data })
    }

    // List: authenticate and filter by user's broker_id
    const auth = await getAuthFromRequest(req)
    const brokerId = auth.userId ?? req.nextUrl.searchParams.get('broker_id')

    let query = db.from('submissions').select('*').order('created_at', { ascending: false })
    if (brokerId) query = query.eq('broker_id', brokerId)

    const { data, error } = await query
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

    // Validate auth — only allow deleting own submissions
    const auth = await getAuthFromRequest(req)
    if (auth.userId) {
      // Verify the submission belongs to this user
      const { data: sub } = await db.from('submissions').select('broker_id').eq('id', id).maybeSingle()
      if (sub && sub.broker_id !== auth.userId) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 })
      }
    }

    await db.from('submissions').delete().eq('id', id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
