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
    return NextResponse.json({ error: 'Минимум 3 символа' }, { status: 400 })
  }

  const apiKey = process.env.COMPANYBOOK_API_KEY ?? ''

  try {
    const res = await fetch(
      `https://api.companybook.bg/api/companies/search?name=${encodeURIComponent(name)}&status=true&limit=10`,
      {
        headers: { 'X-API-Key': apiKey },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) {
      return NextResponse.json({ results: [] })
    }

    const data = await res.json()
    return NextResponse.json({ results: (data.results ?? []) as CompanySearchResult[] })
  } catch (err) {
    console.error('[EIK search]', err)
    return NextResponse.json({ results: [] })
  }
}
