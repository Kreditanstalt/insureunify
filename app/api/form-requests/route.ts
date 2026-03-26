import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL ?? 'smitchev@yahoo.com'
const FROM_EMAIL = process.env.BROKER_FROM_EMAIL ?? 'info@insureunify.online'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const insurerName = formData.get('insurer_name') as string
    const insuranceClass = formData.get('insurance_class') as string
    const notes = formData.get('notes') as string | null
    const brokerName = formData.get('broker_name') as string | null
    const brokerEmail = formData.get('broker_email') as string | null
    const file = formData.get('file') as File | null

    if (!insurerName || !insuranceClass) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    const db = getServiceClient()
    if (!db) {
      return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 500 })
    }

    // 1. Insert record to get ID
    const { data: record, error: insertError } = await db
      .from('form_requests')
      .insert({
        insurer_name: insurerName,
        insurance_class: insuranceClass,
        notes: notes || null,
        broker_name: brokerName || null,
        broker_email: brokerEmail || null,
      })
      .select('id, estimated_days')
      .single()

    if (insertError || !record) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ ok: false, error: 'Failed to create request' }, { status: 500 })
    }

    const requestId = record.id as string
    const estimatedDays = record.estimated_days as number
    let fileUrl: string | null = null
    let fileName: string | null = null

    // 2. Upload file to Supabase Storage
    if (file) {
      fileName = file.name
      const filePath = `${requestId}/${fileName}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await db.storage
        .from('form-requests')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
      } else {
        // Get signed URL (valid 7 days)
        const { data: urlData } = await db.storage
          .from('form-requests')
          .createSignedUrl(filePath, 60 * 60 * 24 * 7)

        fileUrl = urlData?.signedUrl ?? null

        // Update record with file info
        await db
          .from('form_requests')
          .update({ file_url: fileUrl, file_name: fileName })
          .eq('id', requestId)
      }
    }

    // 3. Send email notifications
    try {
      // Email 1: to developer
      await resend.emails.send({
        from: FROM_EMAIL,
        to: DEVELOPER_EMAIL,
        subject: `Нов формуляр за добавяне — ${insurerName} / ${insuranceClass}`,
        html: `
          <h2>Нова заявка за формуляр</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;">
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Брокер:</td><td>${brokerName || '—'} (${brokerEmail || '—'})</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Застраховател:</td><td>${insurerName}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Клас:</td><td>${insuranceClass}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Бележки:</td><td>${notes || '—'}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Файл:</td><td>${fileName || '—'}</td></tr>
            ${fileUrl ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Линк към файла:</td><td><a href="${fileUrl}">${fileUrl}</a></td></tr>` : ''}
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">ID:</td><td>${requestId}</td></tr>
          </table>
        `,
      })

      // Email 2: to broker (if email provided)
      if (brokerEmail) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: brokerEmail,
          subject: `Заявката ви е получена — ${insurerName}`,
          html: `
            <div style="font-family:sans-serif;max-width:500px;">
              <h2>Благодарим!</h2>
              <p>Получихме формуляра за <strong>${insurerName}</strong> / <strong>${insuranceClass}</strong>.</p>
              <p>Ще го обработим в рамките на <strong>${estimatedDays} работни дни</strong>.</p>
              <p>Ще получите имейл когато е готово.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
              <p style="color:#999;font-size:12px;">InsureUnify</p>
            </div>
          `,
        })
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr)
      // Don't fail the request if emails fail
    }

    return NextResponse.json({ ok: true, id: requestId })
  } catch (e) {
    console.error('POST /api/form-requests error:', e)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = getServiceClient()
    if (!db) {
      return NextResponse.json({ requests: [] })
    }

    const { data, error } = await db
      .from('form_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET form_requests error:', error)
      return NextResponse.json({ requests: [] })
    }

    return NextResponse.json({ requests: data })
  } catch (e) {
    console.error('GET /api/form-requests error:', e)
    return NextResponse.json({ requests: [] })
  }
}
