import { NextRequest, NextResponse } from 'next/server'

export interface EIKResult {
  found: true
  company_name: string
  address?: string
  city?: string
  email?: string
  phone?: string
  activity?: string
  nkid_code?: string
  representative?: string
  legalForm?: string
}

// ─── Hardcoded fallback registry ─────────────────────────────────────────────

const KNOWN: Record<string, Omit<EIKResult, 'found'>> = {
  '207560726': { company_name: 'ИНС ЦЕНТЪР ООД',                       address: 'гр. София, р-н Триадица, Твърдишки проход 15', legalForm: 'ООД' },
  '831642181': { company_name: 'ЗЕАД БУЛСТРАД ВИЕНА ИНШУРЪНС ГРУП',    address: 'гр. София, пл. Позитано 2' },
  '030485684': { company_name: 'ДЖЕНЕРАЛИ ЗАСТРАХОВАНЕ АД',             address: 'гр. София, бул. Г.М. Димитров 1', legalForm: 'АД' },
  '040275584': { company_name: 'ДЗИ - ОБЩО ЗАСТРАХОВАНЕ ЕАД',          address: 'гр. София, бул. Г.М. Димитров 1', legalForm: 'ЕАД' },
  '121265177': { company_name: 'ЗАД АРМЕЕЦ',                            address: 'гр. София, ул. Стефан Караджа 2' },
  '040451865': { company_name: 'ЗД ЕВРОИНС АД',                        address: 'гр. София, бул. Христофор Колумб 43', legalForm: 'АД' },
  '030269049': { company_name: 'ЗД БУЛ ИНС АД',                        address: 'гр. София, бул. Джеймс Баучер 87', legalForm: 'АД' },
  '834014656': { company_name: 'ГРУПАМА ЗАСТРАХОВАНЕ ЕАД',              address: 'гр. София, бул. Цариградско шосе 47А', legalForm: 'ЕАД' },
  '040451822': { company_name: 'ЛЕВ ИНС АД',                           address: 'гр. София, бул. Черни Връх 51Д', legalForm: 'АД' },
  '830196612': { company_name: 'УНИКА АД',                              address: 'гр. София, ул. Юнак 11-13', legalForm: 'АД' },
}

function extractLegalForm(name: string): string | undefined {
  return name.match(/\b(ЕООД|ООД|ЕАД|АД|ДЗЗД|ЕТ|КД|СД|КООП)\b/i)?.[1]?.toUpperCase()
}

// ─── api.companybook.bg — rich response with contacts, managers, activity ─────

async function tryCompanybook(eik: string): Promise<EIKResult | null> {
  const apiKey = process.env.COMPANYBOOK_API_KEY ?? ''

  const endpoints: Array<{ url: string; headers: Record<string, string> }> = [
    // Official documented endpoint
    {
      url: `https://api.companybook.bg/api/companies/${eik}?with_data=true`,
      headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' },
    },
    // Alt: Bearer token
    {
      url: `https://api.companybook.bg/api/companies/${eik}?with_data=true`,
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
    },
    // Alt: different host format
    {
      url: `https://companybook.bg/api/v2/company/${eik}`,
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
    },
    {
      url: `https://companybook.bg/api/company/${eik}`,
      headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' },
    },
  ]

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { headers: ep.headers, signal: AbortSignal.timeout(6000) })
      if (!res.ok) continue

      const json = await res.json()
      const company = json?.company ?? json?.data ?? json

      // Extract name
      const name: string =
        company?.companyName?.name ??
        company?.company_name ??
        company?.name ??
        company?.naimenovanie ??
        json?.company_name ?? json?.name ?? ''
      if (!name || name.length < 2) continue

      // Address
      const seat = company?.seat ?? {}
      const city: string = seat?.settlement ?? seat?.municipality ?? seat?.region ?? ''
      const streetPart: string = seat?.address ?? company?.address ?? json?.address ?? ''
      const address: string = [streetPart, city].filter(Boolean).join(', ')

      // Contacts
      const contacts = company?.contacts ?? {}
      const email: string   = contacts?.email   ?? company?.email ?? ''
      const phone: string   = contacts?.phone   ?? company?.phone ?? ''

      // Activity
      const activity: string = company?.subjectOfActivity ?? company?.activity ?? ''

      // NKID code
      const nkids: Array<{ code?: string; nkid?: string }> = company?.nkids ?? []
      const nkid_code: string = nkids[0]?.code ?? nkids[0]?.nkid ?? ''

      // Representative — first manager/director
      const managers: Array<{ name?: string; position?: string; role?: string }> =
        company?.managers ?? company?.representatives ?? []
      const mgr = managers[0]
      const representative: string = mgr
        ? [mgr.name, mgr.position ?? mgr.role ?? 'Управител'].filter(Boolean).join(' — ')
        : ''

      return {
        found: true,
        company_name:   name.trim(),
        address:        address || undefined,
        city:           city || undefined,
        email:          email || undefined,
        phone:          phone || undefined,
        activity:       activity || undefined,
        nkid_code:      nkid_code || undefined,
        representative: representative || undefined,
        legalForm:      extractLegalForm(name),
      }
    } catch {
      // try next
    }
  }

  return null
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const eik = req.nextUrl.searchParams.get('eik')?.trim().replace(/\D/g, '')

  if (!eik || !/^\d{9}(\d{4})?$/.test(eik)) {
    return NextResponse.json({ error: 'Невалиден ЕИК' }, { status: 400 })
  }

  // Try live API
  const result = await tryCompanybook(eik)
  if (result) return NextResponse.json(result)

  // Hardcoded fallback
  const known = KNOWN[eik]
  if (known) {
    return NextResponse.json({ ...known, found: true })
  }

  return NextResponse.json({ error: 'Не е намерен в Търговския регистър' }, { status: 404 })
}
