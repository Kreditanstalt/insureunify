export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/apiAuth'
import { getServiceClient } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = await getAuthFromRequest(req)

  const db = getServiceClient()
  let subCount = 0
  let subSample: unknown = null

  if (db && auth.userId) {
    const { data: withBroker } = await db.from('submissions').select('id, broker_id').eq('broker_id', auth.userId).limit(3)
    const { data: withNull } = await db.from('submissions').select('id, broker_id').is('broker_id', null).limit(3)
    const { data: allSubs } = await db.from('submissions').select('id, broker_id').limit(3)

    subCount = allSubs?.length ?? 0
    subSample = {
      withBrokerId: withBroker?.length ?? 0,
      withNullBrokerId: withNull?.length ?? 0,
      total: subCount,
      sampleBrokerIds: allSubs?.map(s => s.broker_id),
    }
  }

  return NextResponse.json({
    auth: {
      userId: auth.userId,
      accountId: auth.accountId,
      email: auth.user?.email,
    },
    cookies: req.cookies.getAll().map(c => c.name).filter(n => n.includes('supabase') || n.includes('sb-')),
    submissions: subSample,
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  })
}
