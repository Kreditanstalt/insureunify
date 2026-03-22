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

    // Name
    const name: string = company.companyName?.name ?? company.name ?? ''
    if (!name) {
      return NextResponse.json({ error: 'Не е намерен в Търговския регистър' }, { status: 404 })
    }

    // Address
    const seat = company.seat ?? {}
    const city: string = seat.settlement ?? seat.municipality ?? seat.region ?? ''
    const streetPart: string = seat.address ?? ''
    const address: string = [streetPart, city].filter(Boolean).join(', ')

    // Contacts
    const contacts = company.contacts ?? {}
    const email: string = contacts.email ?? ''
    const phone: string = contacts.phone ?? ''

    // Activity
    const activity: string = company.subjectOfActivity ?? ''

    // NKID — first code from the array
    const nkids: Array<{ code?: string; nkid?: string }> = company.nkids ?? []
    const nkid_code: string = nkids[0]?.code ?? nkids[0]?.nkid ?? ''

    // Representative — first manager
    const managers: Array<{ name?: string; position?: string; role?: string }> =
      company.managers ?? company.representatives ?? []
    const mgr = managers[0]
    const representative: string = mgr
      ? [mgr.name, mgr.position ?? mgr.role ?? 'Управител'].filter(Boolean).join(' — ')
      : ''

    return NextResponse.json({
      found: true,
      company_name: name,
      address: address || undefined,
      city: city || undefined,
      email: email || undefined,
      phone: phone || undefined,
      activity: activity || undefined,
      nkid_code: nkid_code || undefined,
      representative: representative || undefined,
      legalForm: company.legalForm || undefined,
    })
  } catch (err) {
    console.error('[EIK]', err)
    return NextResponse.json({ error: 'Грешка при търсене' }, { status: 500 })
  }
}
