export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import { getCurrentPlan, getMonthlyUsage } from '@/lib/planLimits'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('user_id')
    if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

    const db = getServiceClient()
    if (!db) return NextResponse.json({ plan: null, usage: null })

    // Get account_id for this user
    const { data: bu } = await db
      .from('broker_users')
      .select('account_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (!bu?.account_id) {
      return NextResponse.json({
        plan: { plan_id: 'trial', plan_name: 'Пробен', trial_ends_at: null, max_submissions_monthly: null, max_insurers_per_submission: 4, account_id: null },
        usage: { submissions_count: 0, month: new Date().toISOString().slice(0, 7) },
      })
    }

    const plan = await getCurrentPlan(bu.account_id, db)
    const usage = await getMonthlyUsage(bu.account_id, db)

    return NextResponse.json({ plan, usage })
  } catch (e) {
    console.error('GET /api/account/plan error:', e)
    return NextResponse.json({ plan: null, usage: null })
  }
}
