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

    // Build vertical card layout — one card per insurer
    const rowStyle = 'padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:13px'
    const labelStyle = 'color:#6b7280;font-size:12px'
    const valueStyle = 'font-weight:600;color:#111827;font-size:14px'

    const offerCards = offers.map((o: { insurer_name: string; extracted_data: Record<string, unknown>; is_recommended: boolean }) => {
      const d = o.extracted_data || {}
      const coverages = Array.isArray(d.coverages) ? (d.coverages as string[]) : []
      const borderColor = o.is_recommended ? '#22c55e' : '#e5e7eb'
      const headerBg = o.is_recommended ? '#f0fdf4' : '#f9fafb'

      const fields = [
        { label: 'Годишна премия', value: d.premium_annual != null ? `${Number(d.premium_annual).toLocaleString('bg-BG')} EUR` : null },
        { label: 'Застрахователна сума', value: d.insured_sum != null ? `${Number(d.insured_sum).toLocaleString('bg-BG')} EUR` : null },
        { label: 'Самоучастие', value: d.deductible },
        { label: 'Начин на плащане', value: d.payment_terms },
        { label: 'Територия', value: d.territory },
        { label: 'Валидна до', value: d.valid_until },
        { label: 'Уреждане на щети', value: d.claim_settlement },
      ].filter(f => f.value != null && f.value !== '' && f.value !== '-')

      return `
        <div style="border:2px solid ${borderColor};border-radius:12px;margin-bottom:16px;overflow:hidden">
          <div style="background:${headerBg};padding:12px 16px;border-bottom:1px solid ${borderColor}">
            <div style="font-size:16px;font-weight:700;color:#111827">${o.insurer_name}${o.is_recommended ? ' ⭐ <span style="color:#16a34a;font-size:12px;font-weight:600">ПРЕПОРЪЧАНА</span>' : ''}</div>
            ${d.premium_annual != null ? `<div style="font-size:20px;font-weight:800;color:#2563eb;margin-top:4px">${Number(d.premium_annual).toLocaleString('bg-BG')} EUR<span style="font-size:12px;font-weight:400;color:#6b7280"> / годишно</span></div>` : ''}
          </div>
          <div style="padding:12px 16px">
            ${fields.map(f => `
              <div style="${rowStyle}">
                <div style="${labelStyle}">${f.label}</div>
                <div style="${valueStyle}">${f.value}</div>
              </div>
            `).join('')}
            ${coverages.length > 0 ? `
              <div style="margin-top:8px">
                <div style="${labelStyle};margin-bottom:4px">Покрития:</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px">
                  ${coverages.map(c => `<span style="display:inline-block;background:#f3f4f6;border-radius:4px;padding:2px 8px;font-size:11px;color:#374151;margin:2px">${c}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>`
    }).join('')

    const dateStr = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric' })

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#2563eb;padding:20px 24px;border-radius:12px 12px 0 0">
          <h2 style="color:#ffffff;margin:0;font-size:18px">Сравнение на оферти</h2>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">${classLabel} · ${dateStr}</p>
        </div>
        <div style="background:#ffffff;padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="color:#6b7280;font-size:14px;margin-bottom:4px">Клиент: <strong style="color:#111827">${client_name || compClientName}</strong></p>
          <p style="color:#9ca3af;font-size:12px;margin-bottom:16px">${offers.length} ${offers.length === 1 ? 'оферта' : 'оферти'}</p>
          ${message ? `<div style="color:#374151;background:#f9fafb;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:13px;border-left:3px solid #2563eb">${message}</div>` : ''}
          ${offerCards}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
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
