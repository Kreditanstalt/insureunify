import { NextRequest, NextResponse } from 'next/server'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'bg-BG,bg;q=0.9,en;q=0.8',
}

export async function GET(req: NextRequest) {
  const eik = req.nextUrl.searchParams.get('eik')?.trim().replace(/\D/g, '') ?? '201859928'

  const [brraRes, regRes] = await Promise.allSettled([
    fetch(`https://brra.bg/GetXML.ra?id=${eik}&type=P`, { headers: HEADERS, signal: AbortSignal.timeout(10000) }),
    fetch(`https://portal.registryagency.bg/CR/Reports/VerificationPersonOrg?guid=&UIC=${eik}`, { headers: HEADERS, signal: AbortSignal.timeout(10000) }),
  ])

  const brraText = brraRes.status === 'fulfilled' && brraRes.value.ok
    ? await brraRes.value.text()
    : `ERROR: ${brraRes.status === 'rejected' ? brraRes.reason : brraRes.value.status}`

  const regText = regRes.status === 'fulfilled' && regRes.value.ok
    ? await regRes.value.text()
    : `ERROR: ${regRes.status === 'rejected' ? regRes.reason : regRes.value.status}`

  return NextResponse.json({
    eik,
    brra: {
      status: brraRes.status === 'fulfilled' ? brraRes.value.status : 'error',
      preview: typeof brraText === 'string' ? brraText.slice(0, 1500) : brraText,
    },
    registryagency: {
      status: regRes.status === 'fulfilled' ? regRes.value.status : 'error',
      length: typeof regText === 'string' ? regText.length : 0,
      preview: typeof regText === 'string' ? regText.slice(0, 1500) : regText,
      has_naimenovanie: typeof regText === 'string' && regText.includes('Наименование'),
      has_root_div: typeof regText === 'string' && regText.includes('id="root"'),
    },
  })
}
