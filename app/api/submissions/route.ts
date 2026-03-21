import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = getServiceClient()

  if (!supabase) {
    // No Supabase — client handles localStorage persistence
    return NextResponse.json({ ok: true, id: body.id })
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      id: body.id,
      client_name: body.clientName,
      selected_insurers: body.selectedInsurers,
      form_data: body.formData,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}

export async function GET() {
  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json({ submissions: [] })
  }

  const { data, error } = await supabase
    .from('submissions')
    .select('id, client_name, selected_insurers, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ submissions: data })
}
