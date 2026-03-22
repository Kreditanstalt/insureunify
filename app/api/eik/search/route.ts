import { NextRequest, NextResponse } from 'next/server'

export interface CompanySearchResult {
  uic: string
  name: string
  legalForm: string
  status: string
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')?.trim()
  if (!name || name.length < 3) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.COMPANYBOOK_API_KEY ?? ''

  const endpoints: Array<{ url: string; headers: Record<string, string> }> = [
    {
      url: `https://api.companybook.bg/api/companies/search?name=${encodeURIComponent(name)}&limit=8`,
      headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' },
    },
    {
      url: `https://companybook.bg/api/v2/companies/search?q=${encodeURIComponent(name)}&limit=8`,
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
    },
    {
      url: `https://companybook.bg/api/companies?name=${encodeURIComponent(name)}&limit=8`,
      headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' },
    },
  ]

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { headers: ep.headers, signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue

      const json = await res.json()
      const raw: Array<Record<string, unknown>> =
        (json as Record<string, unknown>)?.companies as Array<Record<string, unknown>> ??
        (json as Record<string, unknown>)?.results   as Array<Record<string, unknown>> ??
        (json as Record<string, unknown>)?.data      as Array<Record<string, unknown>> ??
        (Array.isArray(json) ? json : [])

      if (!raw.length) continue

      const results: CompanySearchResult[] = raw.slice(0, 8).map((c) => {
        const cn = c?.companyName as Record<string, unknown> | undefined
        return {
          uic:       String(c?.uic ?? c?.eik ?? c?.id ?? ''),
          name:      String(cn?.name ?? c?.name ?? c?.company_name ?? ''),
          legalForm: String(c?.legalForm ?? c?.legal_form ?? ''),
          status:    String(c?.status ?? 'active'),
        }
      }).filter((r) => r.uic && r.name)

      if (results.length > 0) return NextResponse.json({ results })
    } catch {
      // try next
    }
  }

  return NextResponse.json({ results: [] })
}
