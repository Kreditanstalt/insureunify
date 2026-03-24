import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? ''

const EXTRACTION_PROMPT = `Extract all insurance offer details from this document. Return a JSON object with these fields:
{
  "premium_annual": number or null (annual premium in BGN),
  "premium_monthly": number or null (monthly premium in BGN),
  "currency": "BGN" or "EUR" or "USD",
  "insured_sum": number or null (total insured amount),
  "deductible": string or null (e.g. "500 BGN" or "1%"),
  "coverage_start": string or null (date),
  "coverage_end": string or null (date),
  "valid_until": string or null (offer validity date),
  "coverages": array of strings (list of included coverages),
  "exclusions": array of strings (list of exclusions if mentioned),
  "special_conditions": array of strings (any special terms),
  "payment_terms": string or null (e.g. "monthly", "annual", "quarterly"),
  "notes": string or null (any other important information)
}
If a field cannot be found in the document, use null.
For coverages, list each coverage as a separate string.
Respond with valid JSON only, no other text.`

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

    if (ANTHROPIC_API_KEY) {
      try {
        const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
        const isPdf = fileType.includes('pdf') || fileName.endsWith('.pdf')
        const isImage = fileType.startsWith('image/')
        const isDocx = fileName.endsWith('.docx') || fileName.endsWith('.doc')

        let content: Anthropic.MessageCreateParams['messages'][0]['content']

        if (isPdf) {
          const base64 = buffer.toString('base64')
          content = [
            {
              type: 'document' as const,
              source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 },
            },
            { type: 'text' as const, text: EXTRACTION_PROMPT },
          ]
        } else if (isImage) {
          const base64 = buffer.toString('base64')
          const mediaType = (fileType || 'image/png') as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
          content = [
            {
              type: 'image' as const,
              source: { type: 'base64' as const, media_type: mediaType, data: base64 },
            },
            { type: 'text' as const, text: EXTRACTION_PROMPT },
          ]
        } else if (isDocx) {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const mammoth = require('mammoth')
          const result = await mammoth.extractRawText({ buffer })
          const text = result.value || ''
          content = `Document content:\n\n${text}\n\n${EXTRACTION_PROMPT}`
        } else {
          // Try as text
          const text = buffer.toString('utf-8')
          content = `Document content:\n\n${text}\n\n${EXTRACTION_PROMPT}`
        }

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: 'You are an insurance offer data extractor. Extract structured data from insurance offer documents. Always respond with valid JSON only, no other text.',
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

    // Save offer to database
    const offerRow = {
      comparison_id: comparisonId,
      insurer_name: insurerName,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      extracted_data: extractedData,
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
    })
  } catch (e) {
    console.error('POST /api/offers/extract error:', e)
    return NextResponse.json({ ok: false, error: 'Extraction failed' }, { status: 500 })
  }
}
