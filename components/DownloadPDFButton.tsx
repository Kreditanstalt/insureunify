'use client'

import { useState } from 'react'
import { useToast } from './ToastProvider'
import type { InsurerKey, FormData } from '@/lib/schema'
import { INSURERS } from '@/lib/schema'
import type { PLFormData } from '@/lib/pl-schema'
import type { GLFormData, GLInsurerKey } from '@/lib/gl-schema'
import { GL_INSURERS } from '@/lib/gl-schema'
import type { OAFormData, OAInsurerKey } from '@/lib/oa-schema'
import { OA_INSURERS } from '@/lib/oa-schema'
import type { TCFormData, TCInsurerKey } from '@/lib/tc-schema'
import { TC_INSURERS } from '@/lib/tc-schema'

type InsuranceClass = 'property' | 'professional_liability' | 'general_liability' | 'occupational_accident' | 'trade_credit'

interface PropertyProps {
  insurerKey:     InsurerKey
  formData:       FormData
  clientName:     string
  insuranceClass?: 'property'
}

interface PLProps {
  insurerKey:     InsurerKey
  formData:       PLFormData
  clientName:     string
  insuranceClass: 'professional_liability'
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

interface TCProps {
  insurerKey:     TCInsurerKey
  formData:       TCFormData
  clientName:     string
  insuranceClass: 'trade_credit'
}

type Props = PropertyProps | PLProps | GLProps | OAProps | TCProps

function getColor(insurerKey: string, insuranceClass: InsuranceClass): string {
  if (insuranceClass === 'general_liability') {
    return GL_INSURERS[insurerKey as GLInsurerKey]?.color ?? '#666'
  }
  if (insuranceClass === 'occupational_accident') {
    return OA_INSURERS[insurerKey as OAInsurerKey]?.color ?? '#666'
  }
  if (insuranceClass === 'trade_credit') {
    return TC_INSURERS[insurerKey as TCInsurerKey]?.color ?? '#666'
  }
  return INSURERS[insurerKey as InsurerKey]?.color ?? '#666'
}

export function DownloadPDFButton({ insurerKey, formData, clientName, insuranceClass = 'property' }: Props) {
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const { error: toastError, warning: toastWarning } = useToast()

  function getFileName(): string {
    const safe = clientName.replace(/\s+/g, '_')
    const prefixMap: Record<string, Record<string, string>> = {
      occupational_accident: { allianz: 'Allianz_TZ', groupama: 'Groupama_TZ', ozk: 'OZK_TZ' },
      general_liability: { generali: 'Generali_OGO', bulstrad: 'Bulstrad_OGO', ozk: 'OZK_OGO' },
      professional_liability: { axiom: 'Axiom_PO', bulstrad: 'Bulstrad_PO', euroins: 'Euroins_PO', ozk: 'OZK_PO' },
      trade_credit: { atradius: 'Atradius_TK', allianz_trade: 'AllianzTrade_TK' },
      property: { bulstrad: 'Bulstrad_Imushestvo', generali: 'Generali_IMSB', instinct: 'Instinct_AllRisks', ozk: 'OZK_Imushestvo' },
    }
    const prefix = prefixMap[insuranceClass as string]?.[insurerKey] ?? insurerKey
    return `${prefix}_${safe}.pdf`
  }

  async function handlePreview() {
    if (loading) return
    setLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const React = (await import('react')).default

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let element: any

      if (insuranceClass === 'occupational_accident') {
        if (insurerKey === 'allianz') {
          const { AllianzOAPDF } = await import('./pdf/AllianzOAPDF')
          element = React.createElement(AllianzOAPDF, { formData: formData as OAFormData, clientName })
        } else if (insurerKey === 'ozk') {
          toastWarning('PDF шаблонът за ОЗК (Трудова злополука) предстои да бъде добавен.')
          setLoading(false)
          return
        } else {
          const { GroupamaOAPDF } = await import('./pdf/GroupamaOAPDF')
          element = React.createElement(GroupamaOAPDF, { formData: formData as OAFormData, clientName })
        }
      } else if (insuranceClass === 'general_liability') {
        if (insurerKey === 'generali') {
          const { GeneraliGLPDF } = await import('./pdf/GeneraliGLPDF')
          element = React.createElement(GeneraliGLPDF, { formData: formData as GLFormData, clientName })
        } else if (insurerKey === 'ozk') {
          toastWarning('PDF шаблонът за ОЗК (ОГО) предстои да бъде добавен.')
          setLoading(false)
          return
        } else {
          const { BulstradGLPDF } = await import('./pdf/BulstradGLPDF')
          element = React.createElement(BulstradGLPDF, { formData: formData as GLFormData, clientName })
        }
      } else if (insuranceClass === 'professional_liability') {
        const plData = formData as PLFormData
        if (insurerKey === 'axiom') {
          const { AxiomPLPDF } = await import('./pdf/AxiomPLPDF')
          element = React.createElement(AxiomPLPDF, { formData: plData, clientName })
        } else if (insurerKey === 'bulstrad') {
          const { BulstradPLPDF } = await import('./pdf/BulstradPLPDF')
          element = React.createElement(BulstradPLPDF, { formData: plData, clientName })
        } else if (insurerKey === 'euroins') {
          const { EuroinsPLPDF } = await import('./pdf/EuroinsPLPDF')
          element = React.createElement(EuroinsPLPDF, { formData: plData, clientName })
        } else if (insurerKey === 'ozk') {
          toastWarning('PDF шаблонът за ОЗК (Проф. отговорност) предстои да бъде добавен.')
          setLoading(false)
          return
        } else {
          toastWarning(`PDF за ${INSURERS[insurerKey as InsurerKey]?.name ?? insurerKey} (ПО) не е наличен.`)
          setLoading(false)
          return
        }
      } else if (insuranceClass === 'trade_credit') {
        const tcData = formData as TCFormData
        if (insurerKey === 'atradius') {
          const { AtradiusTCPDF } = await import('./pdf/AtradiusTCPDF')
          element = React.createElement(AtradiusTCPDF, { formData: tcData, clientName })
        } else {
          const { AllianzTradeTCPDF } = await import('./pdf/AllianzTradeTCPDF')
          element = React.createElement(AllianzTradeTCPDF, { formData: tcData, clientName })
        }
      } else {
        // Property insurance
        if (insurerKey === 'bulstrad') {
          const { BulstradPDF } = await import('./pdf/BulstradPDF')
          element = React.createElement(BulstradPDF, { formData: formData as FormData, clientName })
        } else if (insurerKey === 'generali') {
          const { GeneraliPDF } = await import('./pdf/GeneraliPDF')
          element = React.createElement(GeneraliPDF, { formData: formData as FormData, clientName })
        } else if (insurerKey === 'ozk') {
          const { InsurerDocument } = await import('./pdf/InsurerPDF')
          const { mapFormDataForInsurer } = await import('@/lib/mappings')
          const mapped = mapFormDataForInsurer(formData as FormData, 'ozk')
          element = React.createElement(InsurerDocument, { mappedData: mapped, insurerKey: 'ozk', clientName })
        } else {
          const { InstinctPDF } = await import('./pdf/InstinctPDF')
          element = React.createElement(InstinctPDF, { formData: formData as FormData, clientName })
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(element as any).toBlob()
      const url = URL.createObjectURL(blob)
      const name = getFileName()
      setFileName(name)
      setPreviewUrl(url)
    } catch (err) {
      console.error('PDF generation failed:', err)
      const msg = err instanceof Error ? err.message : String(err)
      toastError(`Грешка при генериране на PDF: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const color = getColor(insurerKey, insuranceClass as InsuranceClass)

  return (
    <>
      <button
        type="button"
        onClick={handlePreview}
        disabled={loading}
        style={{ borderColor: loading ? undefined : color + '66' }}
        className="flex items-center gap-1.5 text-xs px-3 py-2 sm:py-1.5 rounded-lg border text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[36px] sm:min-h-0"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Преглед PDF
          </>
        )}
      </button>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4" onClick={closePreview}>
          <div className="bg-white w-full h-[95vh] sm:h-[85vh] sm:max-w-4xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{fileName}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden sm:inline">Изтегли</span>
                </button>
                <button onClick={closePreview} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* PDF content — iframe on desktop, object on mobile for better scrolling */}
            <div className="flex-1 bg-gray-100 overflow-auto">
              <object data={previewUrl} type="application/pdf" className="w-full h-full hidden sm:block">
                <iframe src={previewUrl} className="w-full h-full border-0" title="PDF Preview" />
              </object>
              {/* Mobile: show download prompt instead of broken iframe */}
              <div className="flex sm:hidden flex-col items-center justify-center h-full px-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">PDF е готов</h3>
                <p className="text-sm text-gray-500 mb-5">{fileName}</p>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Изтегли PDF
                </button>
                <button onClick={closePreview} className="mt-3 text-sm text-gray-500 hover:text-gray-700">
                  Затвори
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
