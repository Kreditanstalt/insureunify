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

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'bg-BG,bg;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
}

// ─── Source 1: papagal.bg HTML scraping ──────────────────────────────────────

async function tryPapagal(eik: string): Promise<EIKResult | null> {
  try {
    const res = await fetch(`https://papagal.bg/eik/${eik}`, {
      headers: { ...BROWSER_HEADERS, Referer: 'https://papagal.bg/' },
      signal: AbortSignal.timeout(8000),
    })
    console.log(`[EIK] papagal status: ${res.status}`)
    if (!res.ok) return null

    const html = await res.text()
    console.log(`[EIK] papagal HTML[:500]: ${html.slice(0, 500)}`)

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    console.log(`[EIK] papagal h1: ${h1Match?.[1] ?? 'NOT FOUND'}`)

    let name = h1Match?.[1]?.trim() ?? ''
    name = name.replace(/^Фирма\s+/i, '').trim()
    if (!name) return null

    const addrMatch = html.match(/БЪЛГАРИЯ,\s*(гр\.[^<"]{5,200})/i)
    const address = addrMatch
      ? ('БЪЛГАРИЯ, ' + addrMatch[1]).replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
      : undefined

    return { company_name: name, address, legalForm: extractLegalForm(name) }
  } catch (err) {
    console.log(`[EIK] papagal error: ${err}`)
  }
  return null
}

// ─── Source 2: brra.bg XML ────────────────────────────────────────────────────

async function tryBRRA(eik: string): Promise<EIKResult | null> {
  try {
    const res = await fetch(`https://brra.bg/GetXML.ra?id=${encodeURIComponent(eik)}&type=P`, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(8000),
    })
    console.log(`[EIK] brra status: ${res.status}`)
    if (!res.ok) return null

    const text = await res.text()
    const nameMatch = text.match(/<Name[^>]*>([^<]+)<\/Name>/i)
    const addrMatch = text.match(/<Address[^>]*>([^<]+)<\/Address>/i)
    if (!nameMatch?.[1]) return null

    const name = nameMatch[1].trim()
    console.log(`[EIK] brra found: ${name}`)
    return {
      company_name: name,
      address: addrMatch?.[1]?.trim() || undefined,
      legalForm: extractLegalForm(name),
    }
  } catch (err) {
    console.log(`[EIK] brra error: ${err}`)
  }
  return null
}

// ─── Source 3: eik.bg HTML scraping ──────────────────────────────────────────

async function tryEikBg(eik: string): Promise<EIKResult | null> {
  try {
    const res = await fetch(`https://eik.bg/${eik}`, {
      headers: { ...BROWSER_HEADERS, Referer: 'https://eik.bg/' },
      signal: AbortSignal.timeout(8000),
    })
    console.log(`[EIK] eik.bg status: ${res.status}`)
    if (!res.ok) return null

    const html = await res.text()
    console.log(`[EIK] eik.bg HTML[:500]: ${html.slice(0, 500)}`)

    // eik.bg shows company name in <h1> or <title>
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    const titleMatch = html.match(/<title[^>]*>([^<|–-]+)/i)
    let name = (h1Match?.[1] ?? titleMatch?.[1] ?? '').trim()
    name = name.replace(/^Фирма\s+/i, '').replace(/[-–|].*$/, '').trim()
    if (!name || name.length < 3) return null

    // Address patterns on eik.bg
    const addrPatterns = [
      /Седалище[^:]*:\s*([^\n<]{5,200})/i,
      /Адрес[^:]*:\s*([^\n<]{5,200})/i,
      /(гр\.[^<\n]{5,150})/i,
    ]
    let address: string | undefined
    for (const p of addrPatterns) {
      const m = html.match(p)
      if (m?.[1]?.trim()) { address = m[1].trim(); break }
    }

    console.log(`[EIK] eik.bg found: ${name}`)
    return { company_name: name, address, legalForm: extractLegalForm(name) }
  } catch (err) {
    console.log(`[EIK] eik.bg error: ${err}`)
  }
  return null
}

// ─── Source 4: Official registry portal HTML scraping ────────────────────────

async function tryRegistryPortal(eik: string): Promise<EIKResult | null> {
  try {
    const url = `https://portal.registryagency.bg/CR/Reports/VerificationPersonOrg?guid=&UIC=${encodeURIComponent(eik)}`
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
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
    if (!name) return null

    let address: string | undefined
    for (const p of addrPatterns) {
      const m = html.match(p)
      if (m?.[1]?.trim()) { address = m[1].trim(); break }
    }

    console.log(`[EIK] registryagency found: ${name}`)
    return { company_name: name, address, legalForm: extractLegalForm(name) }
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

  console.log(`[EIK] Looking up: ${eik}`)

  // Try all sources in parallel, take first hit
  const [papagal, brra, eikBg, registry] = await Promise.allSettled([
    tryPapagal(eik),
    tryBRRA(eik),
    tryEikBg(eik),
    tryRegistryPortal(eik),
  ])

  const result =
    (papagal.status === 'fulfilled' && papagal.value) ||
    (brra.status === 'fulfilled' && brra.value) ||
    (eikBg.status === 'fulfilled' && eikBg.value) ||
    (registry.status === 'fulfilled' && registry.value) ||
    null

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
