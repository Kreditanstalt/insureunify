import { NextRequest, NextResponse } from 'next/server'

export interface EIKResult {
  company_name: string
  address?: string
}

// ─── Source 1: papagal.bg JSON API ──────────────────────────────────────────

async function tryPapagal(eik: string): Promise<EIKResult | null> {
  try {
    const res = await fetch(`https://papagal.bg/api/eik/${eik}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()
    const name: string =
      data?.company ?? data?.name ?? data?.firm ?? data?.naziv ?? ''
    const addr: string =
      data?.address ?? data?.seat ?? data?.sedalishte ?? ''
    if (name) return { company_name: name.trim(), address: addr.trim() || undefined }
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

    // The registry portal renders a table; look for firm name after the UIC cell
    // Pattern 1: table cell after "Наименование" header
    const namePatterns = [
      /Наименование[^<]*<\/[^>]+>\s*<[^>]+>([^<]{3,120})</i,
      /class="[^"]*firm[^"]*"[^>]*>([А-ЯA-Z][^<]{2,100})</i,
      /<b>([А-ЯA-Z][А-ЯA-Zа-яa-z0-9\s"„"'\-–—,\.]+(?:ООД|ЕООД|АД|ЕАД|ДЗЗД|ЕТ|КД|СД|СА|КООП))/,
      /UIC[^<]*<\/[^>]+>\s*<[^>]+>[^<]+<\/[^>]+>\s*<[^>]+>([^<]{3,120})</i,
    ]

    const addrPatterns = [
      /Седалище[^<]*<\/[^>]+>\s*<[^>]+>([^<]{5,200})</i,
      /Адрес[^<]*<\/[^>]+>\s*<[^>]+>([^<]{5,200})</i,
      /адрес на управление[^<]*<\/[^>]+>\s*<[^>]+>([^<]{5,200})</i,
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

    if (name) return { company_name: name, address: address || undefined }
  } catch { /* network / parse error */ }
  return null
}

// ─── Source 3: brra.bg (Bulgarian Registry Agency open data) ────────────────

async function tryBRRA(eik: string): Promise<EIKResult | null> {
  try {
    // BRRA has an unofficial JSON endpoint used by various apps
    const res = await fetch(
      `https://brra.bg/GetXML.ra?id=${encodeURIComponent(eik)}&type=P`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) return null
    const text = await res.text()

    // Parse XML-like response
    const nameMatch = text.match(/<Name[^>]*>([^<]+)<\/Name>/i)
    const addrMatch = text.match(/<Address[^>]*>([^<]+)<\/Address>/i)
    if (nameMatch?.[1]) {
      return {
        company_name: nameMatch[1].trim(),
        address: addrMatch?.[1]?.trim() || undefined,
      }
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

  // Try sources in parallel — take first successful result
  const [papagal, brra, registry] = await Promise.allSettled([
    tryPapagal(eik),
    tryBRRA(eik),
    tryRegistryPortal(eik),
  ])

  const result =
    (papagal.status === 'fulfilled' && papagal.value) ||
    (brra.status === 'fulfilled' && brra.value) ||
    (registry.status === 'fulfilled' && registry.value) ||
    null

  if (result?.company_name) {
    return NextResponse.json(result)
  }

  return NextResponse.json(
    { error: 'Не е намерен в Търговския регистър' },
    { status: 404 }
  )
}
