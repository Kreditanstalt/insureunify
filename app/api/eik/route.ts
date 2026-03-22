import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const eik = req.nextUrl.searchParams.get('eik')?.trim().replace(/\D/g, '')

  if (!eik || !/^\d{9}(\d{4})?$/.test(eik)) {
    return NextResponse.json({ error: 'Невалиден ЕИК' }, { status: 400 })
  }

  const apiKey = process.env.COMPANYBOOK_API_KEY ?? ''

  try {
    const res = await fetch(
      `https://api.companybook.bg/api/companies/${eik}?with_data=true`,
      {
        headers: { 'X-API-Key': apiKey },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Не е намерен в Търговския регистър' }, { status: 404 })
    }

    const data = await res.json()
    const company = data.company ?? data
    const name: string = company.companyName?.name ?? company.name ?? ''
    const seat = company.seat ?? {}
    const city: string = seat.settlement ?? seat.municipality ?? seat.region ?? ''
    const address: string = [seat.address, city].filter(Boolean).join(', ')
    const legalForm: string = company.legalForm ?? ''

    if (!name) {
      return NextResponse.json({ error: 'Не е намерен в Търговския регистър' }, { status: 404 })
    }

    return NextResponse.json({
      found: true,
      company_name: name,
      address: address || undefined,
      city: city || undefined,
      legalForm: legalForm || undefined,
    })
  } catch (err) {
    console.error('[EIK]', err)
    return NextResponse.json({ error: 'Грешка при търсене' }, { status: 500 })
  }
}
