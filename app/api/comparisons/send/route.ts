import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.BROKER_FROM_EMAIL ?? 'info@insureunify.online'

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

    // Merge comparison_data into top level
    const compData = (comparison.comparison_data as Record<string, unknown>) ?? {}
    const compClientName = compData.client_name ?? comparison.client_name ?? ''
    const compInsuranceClass = compData.insurance_class ?? comparison.insurance_class ?? ''

    const { data: offers } = await db
      .from('offers')
      .select('*')
      .eq('comparison_id', comparison_id)
      .order('created_at')

    if (!offers?.length) {
      return NextResponse.json({ ok: false, error: 'No offers to compare' }, { status: 400 })
    }

    const recommended = offers.find((o: { is_recommended: boolean }) => o.is_recommended)
    const classLabel = CLASS_LABELS[String(compInsuranceClass)] ?? String(compInsuranceClass)

    // Build comparison HTML table
    const thStyle = 'padding:8px 12px;border:1px solid #e5e7eb;text-align:left;font-size:13px;background:#f3f4f6'
    const tdStyle = 'padding:8px 12px;border:1px solid #e5e7eb;font-size:13px'

    const tableRows = offers.map((o: { insurer_name: string; extracted_data: Record<string, unknown>; is_recommended: boolean }) => {
      const d = o.extracted_data || {}
      const bg = o.is_recommended ? '#f0fdf4' : '#ffffff'
      const coverages = Array.isArray(d.coverages) ? (d.coverages as string[]).join(', ') : '-'
      return `<tr style="background:${bg}">
        <td style="${tdStyle};font-weight:600">${o.insurer_name}${o.is_recommended ? ' ⭐' : ''}</td>
        <td style="${tdStyle}">${d.premium_annual != null ? `${d.premium_annual} EUR` : '-'}</td>
        <td style="${tdStyle}">${d.insured_sum != null ? `${d.insured_sum} EUR` : '-'}</td>
        <td style="${tdStyle}">${d.deductible ?? '-'}</td>
        <td style="${tdStyle}">${d.payment_terms ?? '-'}</td>
        <td style="${tdStyle}">${d.territory ?? '-'}</td>
      </tr>
      <tr style="background:${bg}">
        <td colspan="6" style="${tdStyle};font-size:11px;color:#6b7280">
          <strong>Покрития:</strong> ${coverages}
        </td>
      </tr>`
    }).join('')

    const dateStr = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric' })

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto">
        <div style="background:#2563eb;padding:20px 24px;border-radius:12px 12px 0 0">
          <h2 style="color:#ffffff;margin:0;font-size:18px">Сравнение на застрахователни оферти</h2>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">${classLabel} · ${dateStr}</p>
        </div>
        <div style="background:#ffffff;padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="color:#6b7280;font-size:14px">Клиент: <strong style="color:#111827">${client_name || compClientName}</strong></p>
          ${message ? `<div style="color:#374151;background:#f9fafb;padding:12px 16px;border-radius:8px;margin:12px 0;font-size:13px;border-left:3px solid #2563eb">${message}</div>` : ''}
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead>
              <tr>
                <th style="${thStyle}">Застраховател</th>
                <th style="${thStyle}">Годишна премия</th>
                <th style="${thStyle}">Застр. сума</th>
                <th style="${thStyle}">Самоучастие</th>
                <th style="${thStyle}">Плащане</th>
                <th style="${thStyle}">Територия</th>
              </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
          ${recommended ? `<div style="color:#166534;background:#f0fdf4;padding:12px 16px;border-radius:8px;margin:16px 0;font-size:13px">⭐ Препоръчана оферта: <strong>${recommended.insurer_name}</strong></div>` : ''}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
          <p style="color:#9ca3af;font-size:11px;text-align:center">Изпратено от InsureUnify · insureunify.online</p>
        </div>
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
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: `Грешка при изпращане: ${msg}` }, { status: 500 })
  }
}
