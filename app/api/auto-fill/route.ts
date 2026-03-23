import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

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
  if (!file) {
    return NextResponse.json({ error: 'Липсва файл' }, { status: 400 })
  }

  const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Файлът е прекалено голям (макс. 10 MB)' }, { status: 400 })
  }

  const mimeType = file.type
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let messages: object[]

  try {
    if (mimeType === 'application/pdf') {
      // Extract text from PDF using pdf-parse
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: buffer })
      const result = await parser.getText()
      const extractedText = (result.text ?? '').slice(0, 20000)

      messages = [
        {
          role: 'user',
          content: buildTextPrompt(extractedText),
        },
      ]
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      // Extract text from DOCX using mammoth
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      const extractedText = result.value?.slice(0, 20000) ?? ''

      messages = [
        {
          role: 'user',
          content: buildTextPrompt(extractedText),
        },
      ]
    } else if (mimeType.startsWith('image/')) {
      // Send image directly to Claude Vision
      const base64 = buffer.toString('base64')
      const mediaType = mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: buildVisionPrompt(),
            },
          ],
        },
      ]
    } else {
      return NextResponse.json(
        { error: 'Неподдържан формат. Моля качете PDF, DOCX или изображение.' },
        { status: 415 },
      )
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
        max_tokens: 4000,
        messages,
      }),
    })
  } catch (err) {
    console.error('Claude API network error:', err)
    return NextResponse.json({ error: 'Неуспешна връзка с AI услугата' }, { status: 502 })
  }

  if (!claudeResponse.ok) {
    const errBody = await claudeResponse.text()
    console.error('Claude API error:', claudeResponse.status, errBody)
    return NextResponse.json(
      { error: `AI грешка: ${claudeResponse.status}` },
      { status: 502 },
    )
  }

  const claudeData = await claudeResponse.json()
  const rawText: string = claudeData?.content?.[0]?.text ?? ''

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

  let extracted: Record<string, string | null>
  try {
    extracted = JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse Claude JSON:', rawText)
    return NextResponse.json({ error: 'AI върна невалиден отговор' }, { status: 500 })
  }

  return NextResponse.json({ extracted })
}

function buildTextPrompt(text: string): string {
  return `Извлечи следните данни от този застрахователен документ.
Върни САМО JSON без markdown formatting.
Полета: company_name, eik, address, city, phone, email, activity, nkid_code,
representative, employees_count, annual_wage_fund, annual_revenue,
property_address, val_buildings, val_machinery, val_equipment, val_goods, val_total,
construction_type, construction_year, floors, area_sqm,
fire_alarm, sprinklers, security_system
Ако поле не е намерено — върни null.
Документ:
${text}`
}

function buildVisionPrompt(): string {
  return `Извлечи следните данни от изображението на застрахователен документ.
Върни САМО JSON без markdown formatting.
Полета: company_name, eik, address, city, phone, email, activity, nkid_code,
representative, employees_count, annual_wage_fund, annual_revenue,
property_address, val_buildings, val_machinery, val_equipment, val_goods, val_total,
construction_type, construction_year, floors, area_sqm,
fire_alarm, sprinklers, security_system
Ако поле не е намерено — върни null.`
}
