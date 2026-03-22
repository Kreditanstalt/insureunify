'use client'

import { useState } from 'react'
import type { InsurerKey, FormData } from '@/lib/schema'
import { INSURERS } from '@/lib/schema'
import type { GLFormData, GLInsurerKey } from '@/lib/gl-schema'
import { GL_INSURERS } from '@/lib/gl-schema'
import type { OAFormData, OAInsurerKey } from '@/lib/oa-schema'
import { OA_INSURERS } from '@/lib/oa-schema'

type InsuranceClass = 'property' | 'general_liability' | 'occupational_accident'

interface PropertyProps {
  insurerKey:     InsurerKey
  formData:       FormData
  clientName:     string
  insuranceClass?: 'property'
}

interface GLProps {
  insurerKey:     GLInsurerKey
  formData:       GLFormData
  clientName:     string
  insuranceClass: 'general_liability'
}

interface OAProps {
  insurerKey:     OAInsurerKey
  formData:       OAFormData
  clientName:     string
  insuranceClass: 'occupational_accident'
}

type Props = PropertyProps | GLProps | OAProps

function getColor(insurerKey: string, insuranceClass: InsuranceClass): string {
  if (insuranceClass === 'general_liability') {
    return GL_INSURERS[insurerKey as GLInsurerKey]?.color ?? '#666'
  }
  if (insuranceClass === 'occupational_accident') {
    return OA_INSURERS[insurerKey as OAInsurerKey]?.color ?? '#666'
  }
  return INSURERS[insurerKey as InsurerKey]?.color ?? '#666'
}

export function DownloadPDFButton({ insurerKey, formData, clientName, insuranceClass = 'property' }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    if (loading) return
    setLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const React = (await import('react')).default

      let element: React.ReactElement

      if (insuranceClass === 'occupational_accident') {
        if (insurerKey === 'allianz') {
          const { AllianzOAPDF } = await import('./pdf/AllianzOAPDF')
          element = React.createElement(AllianzOAPDF, { formData: formData as OAFormData, clientName })
        } else {
          const { GroupamaOAPDF } = await import('./pdf/GroupamaOAPDF')
          element = React.createElement(GroupamaOAPDF, { formData: formData as OAFormData, clientName })
        }
      } else if (insuranceClass === 'general_liability') {
        if (insurerKey === 'generali') {
          const { GeneraliGLPDF } = await import('./pdf/GeneraliGLPDF')
          element = React.createElement(GeneraliGLPDF, { formData: formData as GLFormData, clientName })
        } else {
          const { BulstradGLPDF } = await import('./pdf/BulstradGLPDF')
          element = React.createElement(BulstradGLPDF, { formData: formData as GLFormData, clientName })
        }
      } else {
        // Property insurance
        if (insurerKey === 'bulstrad') {
          const { BulstradPDF } = await import('./pdf/BulstradPDF')
          element = React.createElement(BulstradPDF, { formData: formData as FormData, clientName })
        } else if (insurerKey === 'generali') {
          const { GeneraliPDF } = await import('./pdf/GeneraliPDF')
          element = React.createElement(GeneraliPDF, { formData: formData as FormData, clientName })
        } else {
          const { InstinctPDF } = await import('./pdf/InstinctPDF')
          element = React.createElement(InstinctPDF, { formData: formData as FormData, clientName })
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(element as any).toBlob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url

      const safe = clientName.replace(/\s+/g, '_')
      if (insuranceClass === 'occupational_accident') {
        const prefix = insurerKey === 'allianz' ? 'Allianz_TZ' : 'Groupama_TZ'
        a.download = `${prefix}_${safe}.pdf`
      } else if (insuranceClass === 'general_liability') {
        const prefix = insurerKey === 'generali' ? 'Generali_OGO' : 'Bulstrad_OGO'
        a.download = `${prefix}_${safe}.pdf`
      } else {
        const prefixes: Record<string, string> = {
          bulstrad: 'Bulstrad_Imushestvo',
          generali: 'Generali_IMSB',
          instinct: 'Instinct_AllRisks',
        }
        a.download = `${prefixes[insurerKey] ?? insurerKey}_${safe}.pdf`
      }

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Грешка при генериране на PDF. Моля, опитайте отново.')
    } finally {
      setLoading(false)
    }
  }

  const color = getColor(insurerKey, insuranceClass)

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      style={{ borderColor: loading ? undefined : color + '66' }}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <>
          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Генериране…
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Изтегли PDF
        </>
      )}
    </button>
  )
}
