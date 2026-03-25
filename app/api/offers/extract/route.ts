import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'
import { simpleParser } from 'mailparser'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? ''

// ─── Insurer detection from email domain ─────────────────────────────────────

const INSURER_DOMAINS: Record<string, string> = {
  'bulstrad.bg':     'Булстрад',
  'generali.bg':     'Дженерали',
  'instinct.bg':     'Инстинкт',
  'allianz.bg':      'Алианц',
  'euroins.bg':      'Евроинс',
  'groupama.bg':     'Групама',
  'atradius.com':    'Атрадиус',
  'ozk.bg':          'ОЗК',
  'dzi.bg':          'ДЗИ',
  'armeec.bg':       'Армеец',
  'uniqa.bg':        'Уника',
  'colonnade.bg':    'Колонад',
  'allianz-trade.com': 'Алианц Трейд',
}

function detectInsurerFromEmail(email: string): string {
  if (!email) return ''
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  // Check exact match first
  if (INSURER_DOMAINS[domain]) return INSURER_DOMAINS[domain]
  // Check if domain contains insurer name
  for (const [key, name] of Object.entries(INSURER_DOMAINS)) {
    const baseDomain = key.split('.')[0]
    if (domain.includes(baseDomain)) return name
  }
  return ''
}

// ─── Extraction prompts ──────────────────────────────────────────────────────

const BASE_PROMPT = `Extract ALL insurance offer details from this document. Return a JSON object with these fields:
{
  "premium_annual": number or null (annual premium amount),
  "premium_rate_percent": number or null (if offer gives % tariff rate instead of fixed amount),
  "premium_monthly": number or null (monthly premium if stated),
  "currency": "BGN" or "EUR" or "USD",
  "insured_sum": number or null (total insured/coverage amount),
  "deductible": string or null (e.g. "500 EUR" or "10%"),
  "coverage_start": string or null (date DD.MM.YYYY),
  "coverage_end": string or null (date DD.MM.YYYY),
  "valid_until": string or null (offer validity/expiry date),
  "payment_terms": string or null (e.g. "еднократно", "разсрочено на 2 вноски"),
  "territory": string or null (territorial validity),
  "coverages": array of strings (ALL included coverages, risks, and benefits as separate items),
  "exclusions": array of strings (explicitly excluded risks),
  "special_conditions": array of strings (special terms, requirements, clauses),
  "assistance": string or null (roadside assistance, medical assistance details),
  "claim_settlement": string or null (how claims are settled, repair type),
  "notes": string or null (any other important information)
}
If a field cannot be found, use null.
For coverages array: list EVERY mentioned coverage as a SEPARATE string. Be thorough — extract all.
Example coverages: ["Пожар", "Природни бедствия", "Кражба чрез взлом", "Наводнение", "Гражданска отговорност", "Загуба на доход"]
For exclusions: list what is NOT covered if explicitly mentioned.
Numbers in Bulgarian format: '1 268,06' = 1268.06, '74 500' = 74500.
Respond with valid JSON only, no other text.`

const EMAIL_PROMPT_PREFIX = `This is an insurance offer email from a Bulgarian insurer.
Extract the insurance offer details from the email body below.
Look for: premium amount (премия), insured sum (застрахователна сума),
payment terms (еднократно/разсрочено), deductible (самоучастие),
validity date (валидна до), special conditions, coverage details.
Numbers may be written as: '1 268,06 евро' or '74 500 EUR' or '1.92%' or '1 234.56 лв.'
Convert all amounts to numbers without spaces or commas (e.g. 1268.06).
If the premium is stated with VAT (с ДДС), use the amount without VAT if available.

`

// ─── Main handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const insurerName = formData.get('insurer_name') as string
    const comparisonId = formData.get('comparison_id') as string

    if (!file || !insurerName || !comparisonId) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    const db = getServiceClient()
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name
    const fileType = file.type || fileName.split('.').pop() || ''
    let fileUrl: string | null = null

    // Upload to Supabase Storage
    if (db) {
      const storagePath = `${comparisonId}/${Date.now()}_${fileName}`
      const { error: uploadError } = await db.storage
        .from('offers')
        .upload(storagePath, buffer, { contentType: file.type })
      if (!uploadError) {
        fileUrl = storagePath
      }
    }

    // Extract text/content for AI
    let extractedData: Record<string, unknown> = {}
    let extractionSucceeded = false
    let detectedInsurer = ''

    const isEml = fileName.endsWith('.eml') || fileType === 'message/rfc822'
    const isPdf = fileType.includes('pdf') || fileName.endsWith('.pdf')
    const isImage = fileType.startsWith('image/')
    const isDocx = fileName.endsWith('.docx') || fileName.endsWith('.doc')

    // ─── Parse .eml files ──────────────────────────────────────────────
    let emailText = ''
    let emailSubject = ''
    if (isEml) {
      try {
        const parsed = await simpleParser(buffer)
        emailText = parsed.text || ''
        // If no plain text, try HTML stripped of tags
        if (!emailText && parsed.html) {
          emailText = parsed.html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim()
        }
        emailSubject = parsed.subject || ''
        const senderEmail = parsed.from?.value?.[0]?.address || ''
        detectedInsurer = detectInsurerFromEmail(senderEmail)

        console.log('[EML] Subject:', emailSubject)
        console.log('[EML] Sender:', senderEmail)
        console.log('[EML] Detected insurer:', detectedInsurer || '(none)')
        console.log('[EML] Text length:', emailText.length)
      } catch (emlErr) {
        console.error('[EML] Parse error:', emlErr)
        // Fallback: try raw text extraction
        emailText = buffer.toString('utf-8')
          .replace(/Content-Transfer-Encoding:.*\n/gi, '')
          .replace(/Content-Type:.*\n/gi, '')
          .replace(/MIME-Version:.*\n/gi, '')
      }
    }

    // ─── AI extraction ─────────────────────────────────────────────────
    if (ANTHROPIC_API_KEY) {
      try {
        const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

        let content: Anthropic.MessageCreateParams['messages'][0]['content']

        if (isEml) {
          // For emails: send parsed text, not raw MIME
          const emailContext = [
            emailSubject ? `Subject: ${emailSubject}` : '',
            detectedInsurer ? `Sender insurer: ${detectedInsurer}` : '',
            `Insurer name provided: ${insurerName}`,
            '',
            'Email body:',
            emailText.slice(0, 15000), // Limit text length
          ].filter(Boolean).join('\n')

          content = `${EMAIL_PROMPT_PREFIX}${emailContext}\n\n${BASE_PROMPT}`
        } else if (isPdf) {
          const base64 = buffer.toString('base64')
          content = [
            {
              type: 'document' as const,
              source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 },
            },
            { type: 'text' as const, text: BASE_PROMPT },
          ]
        } else if (isImage) {
          const base64 = buffer.toString('base64')
          const mediaType = (fileType || 'image/png') as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
          content = [
            {
              type: 'image' as const,
              source: { type: 'base64' as const, media_type: mediaType, data: base64 },
            },
            { type: 'text' as const, text: BASE_PROMPT },
          ]
        } else if (isDocx) {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const mammoth = require('mammoth')
          const result = await mammoth.extractRawText({ buffer })
          const text = result.value || ''
          content = `Document content:\n\n${text}\n\n${BASE_PROMPT}`
        } else {
          // Generic text fallback
          const text = buffer.toString('utf-8')
          content = `Document content:\n\n${text.slice(0, 15000)}\n\n${BASE_PROMPT}`
        }

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: 'You are an insurance offer data extractor for the Bulgarian insurance market. Extract structured data from insurance offer documents and emails. Always respond with valid JSON only, no other text. Parse Bulgarian text, numbers with spaces as thousands separators, and amounts in EUR/BGN/лв.',
          messages: [{ role: 'user', content }],
        })

        const responseText = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('')

        // Parse JSON — handle markdown code blocks
        const jsonStr = responseText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
        extractedData = JSON.parse(jsonStr)
        extractionSucceeded = true
      } catch (aiErr) {
        console.error('AI extraction error:', aiErr)
      }
    }

    // ─── Save offer to database ────────────────────────────────────────

    // Use detected insurer if the user-provided one is generic
    const finalInsurerName = insurerName || detectedInsurer

    const offerRow = {
      comparison_id: comparisonId,
      insurer_name: finalInsurerName,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      extracted_data: {
        ...extractedData,
        ...(detectedInsurer ? { _detected_insurer: detectedInsurer } : {}),
        ...(emailSubject ? { _email_subject: emailSubject } : {}),
      },
      manually_edited: false,
      is_recommended: false,
    }

    let savedOffer = offerRow
    if (db) {
      const { data, error } = await db
        .from('offers')
        .insert(offerRow)
        .select()
        .single()
      if (error) console.error('Offer save error:', error)
      if (data) savedOffer = data
    }

    return NextResponse.json({
      ok: true,
      offer: savedOffer,
      extraction_succeeded: extractionSucceeded,
      detected_insurer: detectedInsurer || null,
    })
  } catch (e) {
    console.error('POST /api/offers/extract error:', e)
    return NextResponse.json({ ok: false, error: 'Extraction failed' }, { status: 500 })
  }
}
