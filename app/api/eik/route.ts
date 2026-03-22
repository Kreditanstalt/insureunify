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

// ─── Source 1: papagal.bg HTML scraping ──────────────────────────────────────

async function tryPapagal(eik: string): Promise<EIKResult | null> {
  try {
    const res = await fetch(`https://papagal.bg/eik/${eik}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'bg,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    })

    console.log(`[EIK] papagal.bg status: ${res.status}`)
    if (!res.ok) return null

    const html = await res.text()
    console.log(`[EIK] papagal.bg HTML (first 500): ${html.slice(0, 500)}`)

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    console.log(`[EIK] papagal.bg <h1> match: ${h1Match?.[1] ?? 'NOT FOUND'}`)

    let name = h1Match?.[1]?.trim() ?? ''
    name = name.replace(/^Фирма\s+/i, '').trim()
    if (!name) return null

    let address = ''
    const addrMatch = html.match(/БЪЛГАРИЯ,\s*(гр\.[^<"]{5,200})/i)
    if (addrMatch?.[1]) {
      address = ('БЪЛГАРИЯ, ' + addrMatch[1]).trim()
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
    }

    const legalFormMatch = name.match(/\b(ЕООД|ООД|ЕАД|АД|ДЗЗД|ЕТ|КД|СД|КООП)\b/i)
    const legalForm = legalFormMatch?.[1]?.toUpperCase()

    return { company_name: name, address: address || undefined, legalForm: legalForm || undefined }
  } catch (err) {
    console.log(`[EIK] papagal.bg error: ${err}`)
  }
  return null
}

// ─── Source 2: TheCompanyBook API ────────────────────────────────────────────

async function tryTheCompanyBook(eik: string): Promise<EIKResult | null> {
  try {
    const res = await fetch(`https://www.thecompanybook.bg/api/company/${eik}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    })

    console.log(`[EIK] thecompanybook status: ${res.status}`)
    if (!res.ok) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()
    const name: string = data?.name ?? data?.company_name ?? data?.naziv ?? ''
    const addr: string = data?.address ?? data?.seat ?? data?.registered_address ?? ''

    if (!name) return null

    const legalFormMatch = name.match(/\b(ЕООД|ООД|ЕАД|АД|ДЗЗД|ЕТ|КД|СД|КООП)\b/i)
    const legalForm = legalFormMatch?.[1]?.toUpperCase()

    console.log(`[EIK] thecompanybook found: ${name}`)
    return { company_name: name.trim(), address: addr.trim() || undefined, legalForm: legalForm || undefined }
  } catch (err) {
    console.log(`[EIK] thecompanybook error: ${err}`)
  }
  return null
}

// ─── Source 3: Official registry portal (HTML scraping) ─────────────────────

async function tryRegistryPortal(eik: string): Promise<EIKResult | null> {
  try {
    const url =
      `https://portal.registryagency.bg/CR/Reports/VerificationPersonOrg` +
      `?guid=&UIC=${encodeURIComponent(eik)}`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'bg,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    })

    console.log(`[EIK] registryagency status: ${res.status}`)
    if (!res.ok) return null
    const html = await res.text()

    const namePatterns = [
      /Наименование[^<]*<\/[^>]+>\s*<[^>]+>([^<]{3,120})</i,
      /class="[^"]*firm[^"]*"[^>]*>([А-ЯA-Z][^<]{2,100})</i,
      /<b>([А-ЯA-Z][А-ЯA-Zа-яa-z0-9\s"„"'\-–—,\.]+(?:ООД|ЕООД|АД|ЕАД|ДЗЗД|ЕТ|КД|СД|СА|КООП))/,
    ]

    const addrPatterns = [
      /Седалище[^<]*<\/[^>]+>\s*<[^>]+>([^<]{5,200})</i,
      /Адрес[^<]*<\/[^>]+>\s*<[^>]+>([^<]{5,200})</i,
    ]

    let name = ''
    for (const p of namePatterns) {
      const m = html.match(p)
      if (m?.[1]?.trim()) { name = m[1].trim(); break }
    }

    let address = ''
    for (const p of addrPatterns) {
      const m = html.match(p)
      if (m?.[1]?.trim()) { address = m[1].trim(); break }
    }

    if (!name) return null

    const legalFormMatch = name.match(/\b(ЕООД|ООД|ЕАД|АД|ДЗЗД|ЕТ|КД|СД|КООП)\b/i)
    const legalForm = legalFormMatch?.[1]?.toUpperCase()

    console.log(`[EIK] registryagency found: ${name}`)
    return { company_name: name, address: address || undefined, legalForm: legalForm || undefined }
  } catch (err) {
    console.log(`[EIK] registryagency error: ${err}`)
  }
  return null
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const eik = req.nextUrl.searchParams.get('eik')?.trim().replace(/\D/g, '')

  if (!eik || !/^\d{9}(\d{4})?$/.test(eik)) {
    return NextResponse.json({ error: 'Невалиден ЕИК' }, { status: 400 })
  }

  console.log(`[EIK] Looking up EIK: ${eik}`)

  // 1. papagal.bg HTML scraping
  const papagal = await tryPapagal(eik)
  if (papagal?.company_name) {
    return NextResponse.json({ ...papagal, found: true })
  }

  // 2. TheCompanyBook API
  const tcb = await tryTheCompanyBook(eik)
  if (tcb?.company_name) {
    return NextResponse.json({ ...tcb, found: true })
  }

  // 3. Official registry portal
  const registry = await tryRegistryPortal(eik)
  if (registry?.company_name) {
    return NextResponse.json({ ...registry, found: true })
  }

  // 4. Hardcoded fallback
  const known = KNOWN[eik]
  if (known) {
    console.log(`[EIK] Using hardcoded fallback for ${eik}: ${known.company_name}`)
    return NextResponse.json({ ...known, found: true })
  }

  return NextResponse.json(
    { error: 'Не е намерен в Търговския регистър' },
    { status: 404 }
  )
}
