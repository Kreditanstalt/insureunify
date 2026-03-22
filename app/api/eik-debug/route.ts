import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const eik = req.nextUrl.searchParams.get('eik')?.trim().replace(/\D/g, '') ?? '201859928'

  const url = `https://portal.registryagency.bg/CR/Reports/VerificationPersonOrg?guid=&UIC=${encodeURIComponent(eik)}`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'bg-BG,bg;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    })

    const html = await res.text()

    return NextResponse.json({
      status: res.status,
      html_length: html.length,
      html_preview: html.slice(0, 2000),
      contains_eik: html.includes(eik),
      h1_matches: [...html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)].map(m => m[1]),
      title_match: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1],
      naimenovanie: html.includes('Наименование'),
      sedalishte: html.includes('Седалище'),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
