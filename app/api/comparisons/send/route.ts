import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.BROKER_FROM_EMAIL ?? 'noreply@insureunify.vercel.app'

const CLASS_LABELS: Record<string, string> = {
  property: 'Имущество',
  general_liability: 'ОГО',
  occupational_accident: 'Трудова злополука',
  professional_liability: 'Проф. отговорност',
  trade_credit: 'Търговски кредит',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { comparison_id, client_email, client_name, message } = body

    if (!comparison_id || !client_email) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    const db = getServiceClient()
    if (!db) {
      return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 500 })
    }

    // Fetch comparison and offers
    const { data: comparison } = await db
      .from('offer_comparisons')
      .select('*')
      .eq('id', comparison_id)
      .single()

    if (!comparison) {
      return NextResponse.json({ ok: false, error: 'Comparison not found' }, { status: 404 })
    }

    const { data: offers } = await db
      .from('offers')
      .select('*')
      .eq('comparison_id', comparison_id)
      .order('created_at')

    if (!offers?.length) {
      return NextResponse.json({ ok: false, error: 'No offers to compare' }, { status: 400 })
    }

    const recommended = offers.find((o: { is_recommended: boolean }) => o.is_recommended)
    const classLabel = CLASS_LABELS[comparison.insurance_class] ?? comparison.insurance_class

    // Build comparison HTML table
    const tableRows = offers.map((o: { insurer_name: string; extracted_data: Record<string, unknown>; is_recommended: boolean }) => {
      const d = o.extracted_data || {}
      const bg = o.is_recommended ? '#f0fdf4' : '#ffffff'
      return `<tr style="background:${bg}">
        <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600">${o.insurer_name}${o.is_recommended ? ' ⭐' : ''}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${d.premium_annual ?? '-'} лв</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${d.insured_sum ?? '-'} лв</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${d.deductible ?? '-'}</td>
      </tr>`
    }).join('')

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1f2937">Сравнение на застрахователни оферти</h2>
        <p style="color:#6b7280">Клиент: <strong>${client_name || comparison.client_name}</strong></p>
        <p style="color:#6b7280">Клас: <strong>${classLabel}</strong></p>
        ${message ? `<p style="color:#374151;background:#f9fafb;padding:12px;border-radius:8px">${message}</p>` : ''}
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#f3f4f6">
              <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left">Застраховател</th>
              <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left">Годишна премия</th>
              <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left">Застр. сума</th>
              <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left">Самоучастие</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        ${recommended ? `<p style="color:#166534;background:#f0fdf4;padding:12px;border-radius:8px">Препоръчана оферта: <strong>${recommended.insurer_name}</strong></p>` : ''}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="color:#9ca3af;font-size:12px">Изпратено от InsureUnify</p>
      </div>
    `

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: client_email,
        subject: `Сравнение на застрахователни оферти — ${classLabel}`,
        html,
      })
    } catch (emailErr) {
      console.error('Resend email error:', emailErr)
      const msg = emailErr instanceof Error ? emailErr.message : String(emailErr)
      return NextResponse.json({ ok: false, error: `Грешка при изпращане на имейл: ${msg}` }, { status: 500 })
    }

    // Update comparison status
    await db
      .from('offer_comparisons')
      .update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', comparison_id)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('POST /api/comparisons/send error:', e)
    return NextResponse.json({ ok: false, error: 'Send failed' }, { status: 500 })
  }
}
