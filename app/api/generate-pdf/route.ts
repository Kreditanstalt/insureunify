import { NextRequest, NextResponse } from 'next/server'

// PDF generation will be implemented with @react-pdf/renderer
// This endpoint returns a placeholder until the PDF templates are built.
export async function POST(req: NextRequest) {
  const { submission_id, insurer_id } = await req.json()

  if (!submission_id || !insurer_id) {
    return NextResponse.json(
      { error: 'submission_id and insurer_id are required' },
      { status: 400 }
    )
  }

  // TODO: load submission from Supabase, apply mappings, render PDF with @react-pdf/renderer
  return NextResponse.json({
    ok: true,
    message: 'PDF generation not yet implemented',
    submission_id,
    insurer_id,
  })
}
