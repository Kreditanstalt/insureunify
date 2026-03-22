import { NextRequest, NextResponse } from 'next/server'

export interface EIKResult {
  company_name: string
  address?: string
  legalForm?: string
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
    if (!res.ok) return null
    const html = await res.text()

    // Company name is in <h1> tag: e.g. "Фирма ИНС ЦЕНТЪР ООД" or just "ИНС ЦЕНТЪР ООД"
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    let name = h1Match?.[1]?.trim() ?? ''
    // Strip leading "Фирма " prefix if present
    name = name.replace(/^Фирма\s+/i, '').trim()

    if (!name) return null

    // Address: find text after "БЪЛГАРИЯ, гр." pattern
    // e.g. "БЪЛГАРИЯ, гр. София, ул. ..." or in a data field
    let address = ''
    const addrMatch = html.match(/БЪЛГАРИЯ,\s*(гр\.[^<"]{5,200})/i)
    if (addrMatch?.[1]) {
      address = ('БЪЛГАРИЯ, ' + addrMatch[1]).trim()
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
    }

    // Extract legal form from name suffix
    const legalFormMatch = name.match(/\b(ЕООД|ООД|ЕАД|АД|ДЗЗД|ЕТ|КД|СД|КООП)\b/i)
    const legalForm = legalFormMatch?.[1]?.toUpperCase()

    return {
      company_name: name,
      address: address || undefined,
      legalForm: legalForm || undefined,
    }
  } catch { /* network / parse error */ }
  return null
}

// ─── Source 2: Official registry portal (HTML scraping) ─────────────────────

async function tryRegistryPortal(eik: string): Promise<EIKResult | null> {
  try {
    const url =
      `https://portal.registryagency.bg/CR/Reports/VerificationPersonOrg` +
      `?guid=&UIC=${encodeURIComponent(eik)}`

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'bg,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    })
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

    return {
      company_name: name,
      address: address || undefined,
      legalForm: legalForm || undefined,
    }
  } catch { /* network / parse error */ }
  return null
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const eik = req.nextUrl.searchParams.get('eik')?.trim().replace(/\D/g, '')

  if (!eik || !/^\d{9}(\d{4})?$/.test(eik)) {
    return NextResponse.json({ error: 'Невалиден ЕИК' }, { status: 400 })
  }

  // Try papagal.bg first, fall back to registry portal
  const papagal = await tryPapagal(eik)
  if (papagal?.company_name) {
    return NextResponse.json({ ...papagal, found: true })
  }

  const registry = await tryRegistryPortal(eik)
  if (registry?.company_name) {
    return NextResponse.json({ ...registry, found: true })
  }

  return NextResponse.json(
    { error: 'Не е намерен в Търговския регистър' },
    { status: 404 }
  )
}
