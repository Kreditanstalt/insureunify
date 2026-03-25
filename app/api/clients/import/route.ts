import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/apiAuth'
import { v4 as uuidv4 } from 'uuid'

export const maxDuration = 30

// Column name → field mapping (Bulgarian + English headers)
const COL_MAP: Record<string, string> = {
  'наименование': 'company_name', 'фирма': 'company_name', 'име': 'company_name',
  'company': 'company_name', 'name': 'company_name', 'company_name': 'company_name',
  'еик': 'eik', 'булстат': 'eik', 'eik': 'eik', 'uic': 'eik',
  'адрес': 'address', 'address': 'address',
  'град': 'city', 'city': 'city',
  'телефон': 'phone', 'тел': 'phone', 'phone': 'phone',
  'имейл': 'email', 'ел. поща': 'email', 'email': 'email', 'e-mail': 'email',
  'дейност': 'activity', 'activity': 'activity',
  'нкид': 'nkid_code', 'код нкид': 'nkid_code', 'nkid': 'nkid_code',
  'представител': 'representative', 'representative': 'representative',
  'бележки': 'notes', 'notes': 'notes',
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    const brokerId = auth.userId

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Липсва файл' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(ext ?? '')) {
      return NextResponse.json({ error: 'Поддържани формати: .xlsx, .xls, .csv' }, { status: 400 })
    }

    const XLSX = await import('xlsx')
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Файлът е празен' }, { status: 400 })
    }

    // Map columns
    const headers = Object.keys(rows[0])
    const fieldMap: Record<string, string> = {}
    for (const h of headers) {
      const normalized = h.toLowerCase().trim()
      if (COL_MAP[normalized]) fieldMap[h] = COL_MAP[normalized]
    }

    // Transform rows to client records
    const clients: Record<string, unknown>[] = []
    let skipped = 0

    for (const row of rows) {
      const client: Record<string, unknown> = { id: uuidv4() }
      for (const [col, field] of Object.entries(fieldMap)) {
        const val = String(row[col] ?? '').trim()
        if (val) client[field] = val
      }

      // Must have at least company_name
      if (!client.company_name) { skipped++; continue }
      if (brokerId) client.broker_id = brokerId
      client.created_at = new Date().toISOString()
      client.updated_at = new Date().toISOString()
      clients.push(client)
    }

    // Save to Supabase
    const db = getServiceClient()
    let savedCount = 0
    if (db && clients.length > 0) {
      // Batch insert (max 100 at a time)
      for (let i = 0; i < clients.length; i += 100) {
        const batch = clients.slice(i, i + 100)
        const { error } = await db.from('clients').upsert(batch as Record<string, unknown>[], {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        if (!error) savedCount += batch.length
        else console.error('Import batch error:', error)
      }
    }

    return NextResponse.json({
      ok: true,
      imported: savedCount,
      skipped,
      total: rows.length,
      columns: Object.values(fieldMap),
    })
  } catch (e) {
    console.error('POST /api/clients/import error:', e)
    return NextResponse.json({ error: 'Грешка при импорт' }, { status: 500 })
  }
}
