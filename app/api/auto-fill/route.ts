import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

// ─── Insurance class detection keywords ──────────────────────────────────────

const CLASS_KEYWORDS: Record<string, string[]> = {
  property: ['имущество', 'пожар', 'сгради', 'all risks', 'имуществена', 'каско', 'стоки и материали'],
  general_liability: ['обща гражданска', 'ого', 'отговорност на работодател', 'general liability', 'гражданска отговорност'],
  occupational_accident: ['трудова злополука', 'злополука', 'групова застраховка', 'accident'],
  professional_liability: ['професионална отговорност', 'errors and omissions', 'e&o', 'проф. отговорност'],
  trade_credit: ['търговски кредит', 'trade credit', 'кредитна застраховка'],
}

// ─── Comprehensive extraction prompt ─────────────────────────────────────────

const EXTRACTION_PROMPT = `You are extracting data from a Bulgarian insurance document (policy, proposal, questionnaire, or offer).
Analyze the document carefully and extract ALL available fields.

Return ONLY a JSON object with these fields (use null if not found):

COMPANY INFO:
- "company_name": string — company/person name (Наименование)
- "eik": string — Bulgarian company ID (ЕИК/БУЛСТАТ, 9 or 13 digits)
- "city": string — city name only (e.g. "София", "Пловдив")
- "address": string — street address without city (ул., бул., номер, етаж)
- "phone": string — phone number
- "email": string — email address
- "activity": string — main business activity description
- "nkid_code": string — NKID/NACE code (e.g. "47.11")
- "representative": string — company representative name

INSURED PROPERTY:
- "property_city": string — insured property city
- "property_address": string — insured property street address
- "object_activity": string — activity at insured location. Map to one of: shop, warehouse, office, production, non_production, hotel, restaurant, residential, other
- "building_purpose": string — building purpose. Map to one of: admin, commercial, production, warehouse, hotel, residential, mixed, other

BUILDING INFO:
- "construction_type": string — Map to: reinforced_concrete, metal, brick, wooden, other
- "construction_year": string — year built (e.g. "2005")
- "roof_type": string — Map to: reinforced_concrete, tiles, metal, other
- "floors": string — number of floors
- "area_sqm": string — total area in sq.m.
- "last_renovation": string — year of last renovation
- "sandwich_panels": string — Map to: none, xps, eps, pur, pir, mineral

PROPERTY VALUES (numbers only, no currency symbols):
- "val_buildings": string — buildings value
- "val_machinery": string — machinery value
- "val_electronics": string — electronics value
- "val_inventory": string — inventory/furniture value
- "val_stock": string — stock/materials value
- "val_other_dma": string — other fixed assets value
- "val_third_party": string — third party property value
- "val_cash": string — cash value
- "val_total": string — total insured sum

FIRE SAFETY:
- "fire_alarm": string — Map to: automatic, manual, none
- "sprinklers": string — Map to: yes, no
- "fire_extinguishers": string — Map to: yes, no
- "hydrants": string — Map to: yes, no
- "fire_station_distance": string — Map to: lt_1, 1_3, 3_5, 5_10, gt_10
- "fire_compliance": string — Map to: yes, no

SECURITY:
- "alarm_system": string — Map to: sot, local, none
- "guard_type": string — Map to: own, specialized, night, round_clock, none
- "cctv": string — Map to: yes, no
- "occupancy": string — Map to: working_hours, constant, year_round

RISK & CLAIMS:
- "hazardous_materials": string — Map to: yes, no
- "water_basin_distance": string — Map to: lt_500, 500_1000, 1000_1500, gt_1500
- "landslide_area": string — Map to: yes, no
- "previous_claims": string — Map to: yes, no
- "claims_details": string — description of past claims

BENEFICIARY:
- "beneficiary_type": string — Map to: none, bank, landlord, other_legal
- "beneficiary_name": string — beneficiary name (bank, landlord)

CONTRACT:
- "period_from": string — start date (YYYY-MM-DD format)
- "period_to": string — end date (YYYY-MM-DD format)
- "deductible": string — deductible amount/percentage
- "payment_type": string — Map to: single, installments
- "currency": string — EUR, BGN, or USD

EMPLOYEES (for GL/OA):
- "employees_count": string — total employees
- "annual_wage_fund": string — annual wage fund
- "annual_revenue": string — annual revenue/turnover

PROFESSIONAL LIABILITY:
- "insured_profession": string — Map to: accountant, insurance_broker, consultant, lawyer, architect, engineer, doctor, it_specialist, appraiser, property_manager, other
- "territory": string — Map to: bg, bg_eu, bg_eu_third, worldwide, other
- "single_limit": string — single event limit
- "aggregate_limit": string — aggregate limit

DETECTED CLASS:
- "insurance_class": string — detected insurance class: property, general_liability, occupational_accident, professional_liability, trade_credit

IMPORTANT:
- For select/dropdown fields, use ONLY the specified mapping values (e.g. "reinforced_concrete" not "Стоманобетонна")
- For numbers, return digits only without spaces or currency (e.g. "150000" not "150 000 EUR")
- For dates, use YYYY-MM-DD format
- Return null for fields not found in the document
- Respond with valid JSON only, no other text`

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI auto-fill не е наличен. Добавете ANTHROPIC_API_KEY.' },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Невалидна заявка' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const insuranceClass = formData.get('insurance_class') as string | null
  if (!file) {
    return NextResponse.json({ error: 'Липсва файл' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Файлът е прекалено голям (макс. 10 MB)' }, { status: 400 })
  }

  const mimeType = file.type
  const buffer = Buffer.from(await file.arrayBuffer())

  let messages: object[]

  try {
    if (mimeType === 'application/pdf') {
      const base64 = buffer.toString('base64')
      messages = [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: EXTRACTION_PROMPT },
        ],
      }]
    } else if (mimeType.includes('wordprocessingml') || mimeType === 'application/msword') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      const text = result.value?.slice(0, 20000) ?? ''
      messages = [{
        role: 'user',
        content: `${EXTRACTION_PROMPT}\n\nДокумент:\n${text}`,
      }]
    } else if (mimeType.startsWith('image/')) {
      const base64 = buffer.toString('base64')
      const mediaType = mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      messages = [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: EXTRACTION_PROMPT },
        ],
      }]
    } else {
      return NextResponse.json({ error: 'Неподдържан формат' }, { status: 415 })
    }
  } catch (err) {
    console.error('File extraction error:', err)
    return NextResponse.json({ error: 'Грешка при четене на файла' }, { status: 500 })
  }

  // Call Claude API
  let claudeResponse: Response
  try {
    claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: 'You are an expert insurance document data extractor for the Bulgarian market. Extract data precisely. Always respond with valid JSON only.',
        messages,
      }),
    })
  } catch (err) {
    console.error('Claude API error:', err)
    return NextResponse.json({ error: 'Неуспешна връзка с AI' }, { status: 502 })
  }

  if (!claudeResponse.ok) {
    const errBody = await claudeResponse.text()
    console.error('Claude API error:', claudeResponse.status, errBody)
    return NextResponse.json({ error: `AI грешка: ${claudeResponse.status}` }, { status: 502 })
  }

  const claudeData = await claudeResponse.json()
  const rawText: string = claudeData?.content?.[0]?.text ?? ''
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

  let extracted: Record<string, string | null>
  try {
    extracted = JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse Claude JSON:', rawText)
    return NextResponse.json({ error: 'AI върна невалиден отговор' }, { status: 500 })
  }

  // Auto-detect insurance class if not provided
  if (!extracted.insurance_class && !insuranceClass) {
    const allText = JSON.stringify(extracted).toLowerCase()
    for (const [cls, keywords] of Object.entries(CLASS_KEYWORDS)) {
      if (keywords.some((kw) => allText.includes(kw))) {
        extracted.insurance_class = cls
        break
      }
    }
  }
  if (insuranceClass) extracted.insurance_class = insuranceClass

  const fieldCount = Object.values(extracted).filter((v) => v !== null && v !== '').length

  return NextResponse.json({ extracted, fieldCount, detectedClass: extracted.insurance_class })
}
