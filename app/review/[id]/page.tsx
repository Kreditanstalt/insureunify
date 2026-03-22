'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { InsurerKey, FormData } from '@/lib/schema'
import { mapFormDataForAllInsurers, InsurerMappedData } from '@/lib/mappings'
import { GLInsurerKey, GLFormData } from '@/lib/gl-schema'
import { mapGLFormDataForAll, GLInsurerMappedData } from '@/lib/gl-mappings'
import { OAInsurerKey, OAFormData } from '@/lib/oa-schema'
import { mapOAFormDataForAll, OAInsurerMappedData } from '@/lib/oa-mappings'
import { mapPLFormDataForAllInsurers, PLInsurerMappedData } from '@/lib/pl-mappings'
import type { PLFormData, PLInsurerKey } from '@/lib/pl-schema'
import ReviewOutput from '@/components/ReviewOutput'

interface BaseSubmission {
  id:               string
  clientName:       string
  createdAt:        string
  insuranceClass?:  string
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

type StoredSubmission = PropertySubmission | GLSubmission | OASubmission | PLSubmission

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
  const [plMapped,       setPlMapped]       = useState<Record<InsurerKey, InsurerMappedData | PLInsurerMappedData> | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('iu_submissions')
    if (!raw) { setNotFound(true); return }

    const list: StoredSubmission[] = JSON.parse(raw)
    const found = list.find((s) => s.id === id)
    if (!found) { setNotFound(true); return }

    setSubmission(found)

    if (found.insuranceClass === 'occupational_accident') {
      const oa = found as OASubmission
      setOaMapped(mapOAFormDataForAll(oa.formData, oa.selectedInsurers))
    } else if (found.insuranceClass === 'general_liability') {
      const gl = found as GLSubmission
      setGlMapped(mapGLFormDataForAll(gl.formData, gl.selectedInsurers))
    } else if (found.insuranceClass === 'professional_liability') {
      const pl = found as PLSubmission
      setPlMapped(
        mapPLFormDataForAllInsurers(pl.formData, pl.selectedInsurers) as Record<InsurerKey, PLInsurerMappedData>
      )
    } else {
      const prop = found as PropertySubmission
      setPropertyMapped(mapFormDataForAllInsurers(prop.formData, prop.selectedInsurers))
    }
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
  if (isOA && !oaMapped)       return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (isGL && !glMapped)       return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (isPL && !plMapped)       return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!isGL && !isOA && !isPL && !propertyMapped) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  const classLabel = isOA ? 'Трудова злополука' : isGL ? 'ОГО — Обща гражданска отговорност' : isPL ? 'Професионална отговорност' : 'Имуществено застраховане'

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
            selectedInsurers={(submission as PLSubmission).selectedInsurers as InsurerKey[]}
            clientName={submission.clientName}
            formData={(submission as PLSubmission).formData}
            insuranceClass="professional_liability"
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
