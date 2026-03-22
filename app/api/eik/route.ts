import { NextRequest, NextResponse } from 'next/server'

export interface EIKResult {
  company_name: string
  address?: string
  legalForm?: string
}

// ─── Hardcoded fallback registry ─────────────────────────────────────────────

const KNOWN: Record<string, EIKResult> = {
  '207560726': { company_name: 'ИНС ЦЕНТЪР ООД', address: 'гр. София, р-н Триадица, Твърдишки проход 15', legalForm: 'ООД' },
  '831642181': { company_name: 'ЗЕАД БУЛСТРАД ВИЕНА ИНШУРЪНС ГРУП', address: 'гр. София, пл. Позитано 2' },
  '030485684': { company_name: 'ДЖЕНЕРАЛИ ЗАСТРАХОВАНЕ АД', address: 'гр. София, бул. Г.М. Димитров 1', legalForm: 'АД' },
  '040275584': { company_name: 'ДЗИ - ОБЩО ЗАСТРАХОВАНЕ ЕАД', address: 'гр. София, бул. Г.М. Димитров 1', legalForm: 'ЕАД' },
  '121265177': { company_name: 'ЗАД АРМЕЕЦ', address: 'гр. София, ул. Стефан Караджа 2' },
  '040451865': { company_name: 'ЗД ЕВРОИНС АД', address: 'гр. София, бул. Христофор Колумб 43', legalForm: 'АД' },
  '030269049': { company_name: 'ЗД БУЛ ИНС АД', address: 'гр. София, бул. Джеймс Баучер 87', legalForm: 'АД' },
  '834014656': { company_name: 'ГРУПАМА ЗАСТРАХОВАНЕ ЕАД', address: 'гр. София, бул. Цариградско шосе 47А', legalForm: 'ЕАД' },
  '040451822': { company_name: 'ЛЕВ ИНС АД', address: 'гр. София, бул. Черни Връх 51Д', legalForm: 'АД' },
  '830196612': { company_name: 'УНИКА АД', address: 'гр. София, ул. Юнак 11-13', legalForm: 'АД' },
}

function extractLegalForm(name: string): string | undefined {
  return name.match(/\b(ЕООД|ООД|ЕАД|АД|ДЗЗД|ЕТ|КД|СД|КООП)\b/i)?.[1]?.toUpperCase()
}

function parseCompanybookJson(body: string): EIKResult | null {
  try {
    const json = JSON.parse(body)
    // Try common field names returned by companybook.bg
    const name: string =
      json?.company_name ?? json?.name ?? json?.naimenovanie ?? json?.data?.company_name ?? ''
    if (!name || name.length < 2) return null

    const address: string | undefined =
      json?.address ?? json?.sedалище ?? json?.data?.address ?? undefined

    return { company_name: name.trim(), address: address?.trim(), legalForm: extractLegalForm(name) }
  } catch {
    return null
  }
}

// ─── companybook.bg — try all known API endpoint variants sequentially ────────

async function tryCompanybook(eik: string): Promise<EIKResult | null> {
  const apiKey = process.env.COMPANYBOOK_API_KEY ?? ''

  const variants: Array<{ label: string; url: string; headers?: Record<string, string> }> = [
    {
      label: 'A — /api/v2/company/:eik (Bearer)',
      url: `https://companybook.bg/api/v2/company/${eik}`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    },
    {
      label: 'B — /api/company/:eik (X-API-Key)',
      url: `https://companybook.bg/api/company/${eik}`,
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json',
      },
    },
    {
      label: 'C — /api/company/:eik?api_key=...',
      url: `https://companybook.bg/api/company/${eik}?api_key=${encodeURIComponent(apiKey)}`,
      headers: { Accept: 'application/json' },
    },
    {
      label: 'D — /company/:eik.json (Bearer)',
      url: `https://companybook.bg/company/${eik}.json`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    },
  ]

  for (const v of variants) {
    try {
      console.log(`[EIK] Trying variant ${v.label}:`, v.url)
      const res = await fetch(v.url, {
        headers: v.headers,
        signal: AbortSignal.timeout(8000),
      })
      console.log(`[EIK] Status:`, res.status)
      const body = await res.text()
      console.log(`[EIK] Body:`, body.substring(0, 500))

      if (!res.ok) continue

      const result = parseCompanybookJson(body)
      if (result) {
        console.log(`[EIK] companybook found via ${v.label}:`, result.company_name)
        return result
      }
    } catch (err) {
      console.log(`[EIK] variant ${v.label} error:`, err)
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

  console.log(`[EIK] Looking up: ${eik}`)

  const result = await tryCompanybook(eik)

  if (result?.company_name) {
    return NextResponse.json({ ...result, found: true })
  }

  // Hardcoded fallback
  const known = KNOWN[eik]
  if (known) {
    console.log(`[EIK] Using hardcoded fallback for ${eik}`)
    return NextResponse.json({ ...known, found: true })
  }

  return NextResponse.json({ error: 'Не е намерен в Търговския регистър' }, { status: 404 })
}
