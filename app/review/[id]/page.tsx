'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { upsertClient, recordSubmissionForClient } from '@/lib/clients'
import { InsurerKey, FormData } from '@/lib/schema'
import { mapFormDataForAllInsurers, InsurerMappedData } from '@/lib/mappings'
import { GLInsurerKey, GLFormData } from '@/lib/gl-schema'
import { mapGLFormDataForAll, GLInsurerMappedData } from '@/lib/gl-mappings'
import { OAInsurerKey, OAFormData } from '@/lib/oa-schema'
import { mapOAFormDataForAll, OAInsurerMappedData } from '@/lib/oa-mappings'
import { mapPLFormDataForAllInsurers, PLInsurerMappedData } from '@/lib/pl-mappings'
import type { PLFormData, PLInsurerKey } from '@/lib/pl-schema'
import { TC_INSURERS, type TCInsurerKey, type TCFormData } from '@/lib/tc-schema'
import { mapTCFormDataForAll, type TCInsurerMappedData } from '@/lib/tc-mappings'
import ReviewOutput from '@/components/ReviewOutput'
import { DownloadPDFButton } from '@/components/DownloadPDFButton'
import Image from 'next/image'

interface BaseSubmission {
  id:               string
  clientName:       string
  createdAt:        string
  insuranceClass?:  string
  renewedFromId?:   string
}

interface PropertySubmission extends BaseSubmission {
  selectedInsurers: InsurerKey[]
  formData:         FormData
  insuranceClass?:  'property' | undefined
}

interface GLSubmission extends BaseSubmission {
  selectedInsurers: GLInsurerKey[]
  formData:         GLFormData
  insuranceClass:   'general_liability'
}

interface OASubmission extends BaseSubmission {
  selectedInsurers: OAInsurerKey[]
  formData:         OAFormData
  insuranceClass:   'occupational_accident'
}

interface PLSubmission extends BaseSubmission {
  selectedInsurers: PLInsurerKey[]
  formData:         PLFormData
  insuranceClass:   'professional_liability'
}

interface TCSubmission extends BaseSubmission {
  selectedInsurers: TCInsurerKey[]
  formData:         TCFormData
  insuranceClass:   'trade_credit'
}

type StoredSubmission = PropertySubmission | GLSubmission | OASubmission | PLSubmission | TCSubmission

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [submission, setSubmission] = useState<StoredSubmission | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Derived mapped data
  const [propertyMapped, setPropertyMapped] = useState<Record<InsurerKey, InsurerMappedData> | null>(null)
  const [glMapped,       setGlMapped]       = useState<Record<GLInsurerKey, GLInsurerMappedData> | null>(null)
  const [oaMapped,       setOaMapped]       = useState<Record<OAInsurerKey, OAInsurerMappedData> | null>(null)
  const [plMapped,       setPlMapped]       = useState<Record<string, PLInsurerMappedData> | null>(null)
  const [tcMapped,       setTcMapped]       = useState<Record<TCInsurerKey, TCInsurerMappedData> | null>(null)

  useEffect(() => {
    async function loadSubmission() {
      let found: StoredSubmission | null = null

      // Always check localStorage first - it has the complete formData
      const raw = localStorage.getItem('iu_submissions')
      if (raw) {
        try {
          const list: StoredSubmission[] = JSON.parse(raw)
          found = list.find((s) => s.id === id) ?? null
          if (found) console.log('[review] localStorage formData keys:', Object.keys((found as {formData?: Record<string,unknown>}).formData ?? {}).length)
        } catch { /* ignore */ }
      }

      // If not in localStorage, try Supabase
      if (!found) {
        try {
          const res = await fetch(`/api/submissions?id=${id}`)
          const data = await res.json()
          console.log('[review] Supabase response keys:', Object.keys(data.submission ?? {}))
          if (data.submission) {
            const s = data.submission
            found = {
              id:               s.id,
              clientName:       s.client_name ?? s.clientName,
              insuranceClass:   s.insurance_class ?? s.insuranceClass,
              selectedInsurers: s.selected_insurers ?? s.selectedInsurers ?? [],
              formData:         s.form_data ?? s.formData ?? {},
              createdAt:        s.created_at ?? s.createdAt,
              renewedFromId:    s.renewed_from_id ?? s.renewedFromId ?? undefined,
            } as StoredSubmission
            console.log('[review] Supabase formData keys:', Object.keys((found.formData as Record<string,unknown>) ?? {}).length)
          }
        } catch (e) { console.log('[review] Supabase error:', e) }
      }

      if (!found) { setNotFound(true); return }

    setSubmission(found)

    // Auto-save client profile from submission data
    try {
      const fd = (found as { formData?: Record<string, unknown> }).formData ?? {}
      const cls = found.insuranceClass ?? 'property'
      const eik = String(
        cls === 'general_liability'     ? (fd.gl_eik ?? '') :
        cls === 'occupational_accident' ? (fd.oa_eik ?? '') :
        cls === 'professional_liability'? (fd.pl_eik ?? fd.pl_insured_eik ?? '') :
        (fd.eik ?? '')
      ) || undefined
      const name = String(
        cls === 'general_liability'     ? (fd.gl_company_name ?? found.clientName) :
        cls === 'occupational_accident' ? (fd.oa_company_name ?? found.clientName) :
        cls === 'professional_liability'? (fd.pl_company_name ?? found.clientName) :
        (fd.company_name ?? found.clientName)
      )
      const client = upsertClient({
        company_name:   name,
        eik,
        address:        String(cls === 'general_liability' ? (fd.gl_address ?? '') : cls === 'occupational_accident' ? (fd.oa_address ?? '') : cls === 'professional_liability' ? (fd.pl_address ?? '') : (fd.address ?? '')) || undefined,
        phone:          String(cls === 'general_liability' ? (fd.gl_phone ?? '') : cls === 'occupational_accident' ? (fd.oa_phone ?? '') : cls === 'professional_liability' ? (fd.pl_phone ?? '') : (fd.phone ?? '')) || undefined,
        email:          String(cls === 'general_liability' ? (fd.gl_email ?? '') : cls === 'professional_liability' ? (fd.pl_email ?? '') : (fd.email ?? '')) || undefined,
        activity:       String(cls === 'general_liability' ? (fd.gl_activity ?? '') : cls === 'occupational_accident' ? (fd.oa_activity ?? '') : cls === 'professional_liability' ? (fd.pl_activity ?? '') : (fd.activity ?? '')) || undefined,
        representative: String(cls === 'general_liability' ? (fd.gl_representative ?? '') : (fd.representative ?? '')) || undefined,
        nkid_code:      String(cls === 'general_liability' ? (fd.gl_activity_code ?? fd.nkid_code ?? '') : cls === 'occupational_accident' ? (fd.oa_activity_code ?? fd.nkid_code ?? '') : (fd.nkid_code ?? '')) || undefined,
        employees_count:  Number(cls === 'general_liability' ? fd.gl_employees_count : cls === 'occupational_accident' ? fd.oa_persons_count : cls === 'professional_liability' ? fd.pl_employees_count : undefined) || undefined,
        annual_wage_fund: Number(cls === 'general_liability' ? fd.gl_annual_wage_fund : cls === 'occupational_accident' ? fd.oa_annual_wage_fund : undefined) || undefined,
        annual_revenue:   Number(cls === 'professional_liability' ? fd.pl_annual_revenue : undefined) || undefined,
        ...(cls === 'property' ? {
          property_address:  String(fd.property_address  ?? '') || undefined,
          construction_type: String(fd.construction_type ?? '') || undefined,
          roof_type:         String(fd.roof_type         ?? '') || undefined,
          construction_year: String(fd.construction_year ?? '') || undefined,
          floors:            String(fd.floors            ?? '') || undefined,
          area_sqm:          fd.area_sqm ? (Number(fd.area_sqm) || undefined) : undefined,
          fire_alarm:        String(fd.fire_alarm        ?? '') || undefined,
          sprinklers:        String(fd.sprinklers        ?? '') || undefined,
          security_system:   String(fd.security_system   ?? '') || undefined,
        } : {}),
      })
      recordSubmissionForClient(eik, name, found.createdAt)
      void client
    } catch { /* ignore */ }

    if (found.insuranceClass === 'occupational_accident') {
      const oa = found as OASubmission
      setOaMapped(mapOAFormDataForAll(oa.formData, oa.selectedInsurers))
    } else if (found.insuranceClass === 'general_liability') {
      const gl = found as GLSubmission
      setGlMapped(mapGLFormDataForAll(gl.formData, gl.selectedInsurers))
    } else if (found.insuranceClass === 'professional_liability') {
      const pl = found as PLSubmission
      setPlMapped(
        mapPLFormDataForAllInsurers(pl.formData, pl.selectedInsurers) as Record<string, PLInsurerMappedData>
      )
    } else if (found.insuranceClass === 'trade_credit') {
      const tc = found as { selectedInsurers: TCInsurerKey[]; formData: TCFormData }
      setTcMapped(mapTCFormDataForAll(tc.formData, tc.selectedInsurers))
    } else {
      const prop = found as PropertySubmission
      setPropertyMapped(mapFormDataForAllInsurers(prop.formData, prop.selectedInsurers))
    }
    }
    loadSubmission()
  }, [id])

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Въпросникът не е намерен.</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">Към dashboard</Link>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isGL = submission.insuranceClass === 'general_liability'
  const isOA = submission.insuranceClass === 'occupational_accident'
  const isPL = submission.insuranceClass === 'professional_liability'
  const isTC = submission.insuranceClass === 'trade_credit'
  if (isOA && !oaMapped) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (isGL && !glMapped) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (isPL && !plMapped) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (isTC && !tcMapped) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!isGL && !isOA && !isPL && !isTC && !propertyMapped) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  const classLabel = isOA ? 'Трудова злополука' : isGL ? 'ОГО — Обща гражданска отговорност' : isPL ? 'Професионална отговорност' : isTC ? 'Търговски кредит' : 'Имуществено застраховане'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-none">{submission.clientName}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {classLabel} ·{' '}
                {new Date(submission.createdAt).toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric' })}
                {submission.renewedFromId && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    Подновена от #{submission.renewedFromId.slice(0, 8)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-gray-400">{submission.selectedInsurers.length} застрахователя</span>
            <Link href="/dashboard/new" className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors font-medium">
              + Нов
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {isOA ? (
          <ReviewOutput
            mappedData={oaMapped!}
            selectedInsurers={(submission as OASubmission).selectedInsurers}
            clientName={submission.clientName}
            formData={(submission as OASubmission).formData}
            insuranceClass="occupational_accident"
          />
        ) : isGL ? (
          <ReviewOutput
            mappedData={glMapped!}
            selectedInsurers={(submission as GLSubmission).selectedInsurers}
            clientName={submission.clientName}
            formData={(submission as GLSubmission).formData}
            insuranceClass="general_liability"
          />
        ) : isPL ? (
          <ReviewOutput
            mappedData={plMapped!}
            selectedInsurers={(submission as PLSubmission).selectedInsurers}
            clientName={submission.clientName}
            formData={(submission as PLSubmission).formData}
            insuranceClass="professional_liability"
          />
        ) : isTC ? (
          <TCReviewOutput
            mappedData={tcMapped!}
            selectedInsurers={(submission as TCSubmission).selectedInsurers}
            clientName={submission.clientName}
            formData={(submission as TCSubmission).formData}
          />
        ) : (
          <ReviewOutput
            mappedData={propertyMapped!}
            selectedInsurers={(submission as PropertySubmission).selectedInsurers}
            clientName={submission.clientName}
            formData={(submission as PropertySubmission).formData}
          />
        )}
      </main>
    </div>
  )
}

// ─── TC Review Output ─────────────────────────────────────────────────────────

function TCReviewOutput({
  mappedData,
  selectedInsurers,
  clientName,
  formData,
}: {
  mappedData: Record<TCInsurerKey, TCInsurerMappedData>
  selectedInsurers: TCInsurerKey[]
  clientName: string
  formData: TCFormData
}) {
  return (
    <div className="space-y-6">
      {selectedInsurers.map((key) => {
        const ins = TC_INSURERS[key]
        const data = mappedData[key]
        if (!data) return null
        const entries = Object.entries(data.fields).filter(([, v]) => v && v.trim())
        return (
          <div key={key} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
              style={{ borderLeftWidth: 4, borderLeftColor: ins.color }}>
              <div className="flex-shrink-0 h-10 w-14 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden p-1">
                {ins.logo
                  ? <Image src={ins.logo} alt={ins.name} width={52} height={36} className="object-contain w-full h-full" />
                  : <div className="h-6 w-6 rounded-full" style={{ backgroundColor: ins.color }} />
                }
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{ins.name}</p>
                <p className="text-xs text-gray-400">Търговски кредит · {clientName}</p>
              </div>
              <span className="text-xs text-gray-400">{entries.length} полета</span>
              <DownloadPDFButton
                insurerKey={key}
                formData={formData}
                clientName={clientName}
                insuranceClass="trade_credit"
              />
            </div>
            {/* Fields */}
            <div className="divide-y divide-gray-50">
              {entries.map(([label, value]) => (
                <div key={label} className="flex items-start gap-4 px-6 py-3">
                  <span className="w-64 flex-shrink-0 text-xs text-gray-500">{label}</span>
                  <span className="flex-1 text-sm font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
