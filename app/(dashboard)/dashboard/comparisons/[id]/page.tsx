'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/lib/useAuth'

const INSURER_OPTIONS = [
  { value: 'Булстрад', label: 'Булстрад' },
  { value: 'Дженерали', label: 'Дженерали' },
  { value: 'Инстинкт', label: 'Инстинкт' },
  { value: 'ОЗК', label: 'ОЗК' },
  { value: 'Алианц', label: 'Алианц' },
  { value: 'Групама', label: 'Групама' },
  { value: 'Аксиом', label: 'Аксиом' },
  { value: 'Евроинс', label: 'Евроинс' },
  { value: 'Атрадиус', label: 'Атрадиус' },
  { value: 'Алианц Трейд', label: 'Алианц Трейд' },
  { value: '__custom', label: 'Друг...' },
]

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExtractedData {
  premium_annual?: number | null
  premium_rate_percent?: number | null
  premium_monthly?: number | null
  currency?: string | null
  insured_sum?: number | null
  deductible?: string | null
  coverage_start?: string | null
  coverage_end?: string | null
  valid_until?: string | null
  coverages?: string[]
  exclusions?: string[]
  special_conditions?: string[]
  payment_terms?: string | null
  territory?: string | null
  assistance?: string | null
  claim_settlement?: string | null
  notes?: string | null
  [key: string]: unknown
}

interface Offer {
  id: string
  comparison_id: string
  insurer_name: string
  file_url?: string
  file_name?: string
  file_type?: string
  extracted_data: ExtractedData
  manually_edited: boolean
  is_recommended: boolean
  created_at: string
}

interface Comparison {
  id: string
  submission_id?: string
  client_name: string
  insurance_class: string
  status: string
  notes?: string
  created_at: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CLASS_LABELS: Record<string, string> = {
  property: 'Имущество',
  general_liability: 'ОГО',
  occupational_accident: 'Трудова злополука',
  professional_liability: 'Проф. отговорност',
  trade_credit: 'Търговски кредит',
}

interface FieldDef { key: keyof ExtractedData; label: string; type?: 'number' | 'text' }
interface FieldGroup { label: string; fields: FieldDef[] }

const FIELD_GROUPS: FieldGroup[] = [
  {
    label: 'Цена',
    fields: [
      { key: 'premium_annual', label: 'Годишна премия', type: 'number' },
      { key: 'premium_monthly', label: 'Месечна премия', type: 'number' },
      { key: 'insured_sum', label: 'Застрахователна сума', type: 'number' },
      { key: 'deductible', label: 'Самоучастие', type: 'text' },
      { key: 'payment_terms', label: 'Начин на плащане', type: 'text' },
    ],
  },
  {
    label: 'Условия',
    fields: [
      { key: 'territory', label: 'Територия', type: 'text' },
      { key: 'valid_until', label: 'Валидна до', type: 'text' },
      { key: 'assistance', label: 'Асистанс', type: 'text' },
      { key: 'claim_settlement', label: 'Уреждане на щети', type: 'text' },
    ],
  },
]

// ─── Coverage scoring ────────────────────────────────────────────────────────

function scoreCoverage(offer: Offer, allOffers: Offer[]): number {
  let score = 0
  const d = offer.extracted_data ?? {}
  const coverages = d.coverages ?? []

  // Premium points (lower = better, max 40)
  const premiums = allOffers.map((o) => o.extracted_data?.premium_annual).filter((p): p is number => typeof p === 'number' && p > 0)
  if (typeof d.premium_annual === 'number' && d.premium_annual > 0 && premiums.length > 0) {
    const lowest = Math.min(...premiums)
    score += 40 * (lowest / d.premium_annual)
  } else if (premiums.length === 0) {
    score += 20 // no premium data available for any offer
  }

  // Coverage breadth (more = better, max 30)
  const maxCov = Math.max(1, ...allOffers.map((o) => o.extracted_data?.coverages?.length ?? 0))
  score += 30 * (coverages.length / maxCov)

  // Special benefits (max 20)
  const text = [...coverages, d.assistance ?? '', d.claim_settlement ?? '', d.notes ?? ''].join(' ').toLowerCase()
  if (d.assistance || text.includes('асистанс') || text.includes('assistance') || text.includes('пътна помощ')) score += 5
  if (text.includes('официален') || text.includes('оторизиран') || text.includes('dealer')) score += 5
  if (text.includes('24/7') || text.includes('24 часа') || text.includes('денонощ')) score += 5
  if (text.includes('заместващ') || text.includes('replacement') || text.includes('рент а кар')) score += 5

  // Deductible (lower/none = better, max 10)
  const ded = String(d.deductible ?? '').toLowerCase()
  if (!d.deductible || ded === 'няма' || ded === '0' || ded === 'без') {
    score += 10
  } else {
    const num = parseFloat(ded.replace(/[^\d.]/g, ''))
    if (!isNaN(num)) {
      if (num < 500) score += 7
      else if (num < 1000) score += 4
      else score += 1
    } else {
      score += 3
    }
  }

  return Math.round(Math.min(100, score))
}

function getScoreInfo(score: number): { label: string; color: string; bg: string } {
  if (score >= 90) return { label: 'Отлично', color: '#15803d', bg: '#dcfce7' }
  if (score >= 70) return { label: 'Добро', color: '#1d4ed8', bg: '#dbeafe' }
  if (score >= 50) return { label: 'Средно', color: '#a16207', bg: '#fef3c7' }
  return { label: 'Основно', color: '#6b7280', bg: '#f3f4f6' }
}

function getRecommendationReason(best: Offer, allOffers: Offer[]): string {
  const premiums = allOffers.map((o) => ({ id: o.id, p: o.extracted_data?.premium_annual })).filter((x): x is { id: string; p: number } => typeof x.p === 'number' && x.p > 0)
  const bestPremium = best.extracted_data?.premium_annual
  const lowestPremium = premiums.length ? Math.min(...premiums.map((x) => x.p)) : null

  if (typeof bestPremium === 'number' && lowestPremium !== null && bestPremium <= lowestPremium) {
    return 'Най-добра цена'
  }
  const maxCov = Math.max(...allOffers.map((o) => o.extracted_data?.coverages?.length ?? 0))
  const bestCov = best.extracted_data?.coverages?.length ?? 0
  if (bestCov >= maxCov && maxCov > 0) {
    return 'Най-широко покритие'
  }
  return 'Най-добро съотношение цена/покритие'
}

// ─── Send Modal ──────────────────────────────────────────────────────────────

function SendModal({ onClose, onSend }: { onClose: () => void; onSend: (email: string, name: string, msg: string) => void }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Изпрати на клиент</h3>
        <div className="space-y-3">
          <input type="email" placeholder="Имейл на клиента" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none" />
          <input type="text" placeholder="Име на клиента" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none" />
          <textarea placeholder="Допълнително съобщение (незадължително)" value={msg} onChange={(e) => setMsg(e.target.value)} rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none resize-none" />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Отказ</button>
          <button onClick={() => { if (email) onSend(email, name, msg) }}
            disabled={!email}
            className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
            Изпрати
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Editable Cell ───────────────────────────────────────────────────────────

function EditableCell({
  value, onChange, type = 'text', isNull, isManuallyEdited,
}: {
  value: string; onChange: (v: string) => void; type?: 'number' | 'text'; isNull?: boolean; isManuallyEdited?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [localVal, setLocalVal] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setLocalVal(value) }, [value])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={() => { setEditing(false); if (localVal !== value) onChange(localVal) }}
        onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); if (localVal !== value) onChange(localVal) } if (e.key === 'Escape') { setEditing(false); setLocalVal(value) } }}
        className="w-full bg-blue-50 border border-blue-200 rounded px-2 py-1 text-sm outline-none"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={[
        'w-full text-left px-2 py-1 rounded text-sm transition-colors group relative',
        isNull ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50',
      ].join(' ')}
    >
      <span>{value || '-'}</span>
      {isManuallyEdited && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400 ml-1.5 align-middle" title="Ръчно коригирано" />
      )}
      <svg className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
      {isNull && <span className="text-[10px] text-amber-500 block">Моля въведете ръчно</span>}
    </button>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Page
// ═════════════════════════════════════════════════════════════════════════════

export default function ComparisonWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { profile: authProfile } = useAuth()
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedInsurers, setSelectedInsurers] = useState<Set<string>>(new Set())
  const [customInsurer, setCustomInsurer] = useState('')
  const hasCustom = selectedInsurers.has('__custom')
  const effectiveInsurers = Array.from(selectedInsurers)
    .filter((v) => v !== '__custom')
    .concat(hasCustom && customInsurer.trim() ? [customInsurer.trim()] : [])
  const [showSendModal, setShowSendModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [expandCoverages, setExpandCoverages] = useState(false)
  const [expandExclusions, setExpandExclusions] = useState(false)
  const [expandConditions, setExpandConditions] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [pdfFileName, setPdfFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── localStorage helpers ──
  function lsLoadComparison(): Comparison | null {
    try {
      const all: Comparison[] = JSON.parse(localStorage.getItem('iu_comparisons') ?? '[]')
      return all.find((c) => c.id === id) ?? null
    } catch { return null }
  }

  function lsSaveComparison(comp: Comparison) {
    try {
      const all: Comparison[] = JSON.parse(localStorage.getItem('iu_comparisons') ?? '[]')
      const idx = all.findIndex((c) => c.id === comp.id)
      if (idx >= 0) all[idx] = comp; else all.unshift(comp)
      localStorage.setItem('iu_comparisons', JSON.stringify(all))
    } catch { /* ignore */ }
  }

  function lsLoadOffers(): Offer[] {
    try {
      const all: Record<string, Offer[]> = JSON.parse(localStorage.getItem('iu_offers') ?? '{}')
      return all[id] ?? []
    } catch { return [] }
  }

  function lsSaveOffers(list: Offer[]) {
    try {
      const all: Record<string, Offer[]> = JSON.parse(localStorage.getItem('iu_offers') ?? '{}')
      all[id] = list
      localStorage.setItem('iu_offers', JSON.stringify(all))
    } catch { /* ignore */ }
  }

  // ── Load comparison & offers ──
  useEffect(() => {
    // Load from localStorage immediately
    const lsComp = lsLoadComparison()
    if (lsComp) {
      setComparison(lsComp)
    } else {
      // Fallback: create a new comparison object so the page always renders
      const fallback: Comparison = {
        id,
        client_name: '',
        insurance_class: 'property',
        status: 'draft',
        created_at: new Date().toISOString(),
      }
      setComparison(fallback)
      lsSaveComparison(fallback)
    }
    setOffers(lsLoadOffers())
    setLoading(false)

    // Then try Supabase in background
    Promise.all([
      fetch(`/api/comparisons?id=${id}`).then((r) => r.json()).catch(() => ({ comparisons: [] })),
      fetch(`/api/offers?comparison_id=${id}`).then((r) => r.json()).catch(() => ({ offers: [] })),
    ]).then(([compRes, offersRes]) => {
      const found = (compRes.comparisons ?? [])[0]
      if (found) { setComparison(found); lsSaveComparison(found) }
      if (offersRes.offers?.length) { setOffers(offersRes.offers); lsSaveOffers(offersRes.offers) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ── Toggle insurer selection ──
  function toggleInsurer(value: string) {
    setSelectedInsurers((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value); else next.add(value)
      if (value !== '__custom' || !next.has('__custom')) { /* keep custom text */ }
      return next
    })
  }

  // ── Upload & extract ──
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0 || effectiveInsurers.length === 0) return

    const validExts = ['pdf', 'docx', 'doc', 'eml', 'png', 'jpg', 'jpeg']
    const validFiles = files.filter((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase()
      return validExts.includes(ext ?? '')
    })
    if (validFiles.length === 0) {
      showToast('Поддържани формати: PDF, Word, имейл, изображения')
      return
    }

    setUploading(true)
    let successCount = 0
    let errorCount = 0

    try {
      // For each file × each insurer, create an offer
      const tasks = validFiles.flatMap((file) =>
        effectiveInsurers.map(async (insurer) => {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('insurer_name', insurer)
          fd.append('comparison_id', id)

          try {
            const res = await fetch('/api/offers/extract', { method: 'POST', body: fd })
            const data = await res.json()
            if (data.ok && data.offer) {
              const newOffer = { ...data.offer, id: data.offer.id || uuidv4() }
              setOffers((prev) => { const next = [...prev, newOffer]; lsSaveOffers(next); return next })
              successCount++
            } else {
              errorCount++
            }
          } catch {
            errorCount++
          }
        })
      )

      await Promise.all(tasks)

      setSelectedInsurers(new Set())
      setCustomInsurer('')

      if (errorCount === 0) {
        showToast(successCount === 1 ? 'Данните са извлечени успешно' : `${successCount} оферти добавени успешно`)
      } else {
        showToast(`${successCount} успешни, ${errorCount} с грешка`)
      }
    } catch {
      showToast('Грешка при качване')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Update offer field ──
  async function updateOfferField(offerId: string, fieldKey: string, value: string) {
    setOffers((prev) => {
      const next = prev.map((o) => {
        if (o.id !== offerId) return o
        const newData = { ...o.extracted_data, [fieldKey]: value }
        return { ...o, extracted_data: newData, manually_edited: true }
      })
      lsSaveOffers(next)
      return next
    })

    const offer = offers.find((o) => o.id === offerId)
    if (!offer) return
    const newData = { ...offer.extracted_data, [fieldKey]: value }

    fetch(`/api/offers/${offerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extracted_data: newData, manually_edited: true }),
    }).catch(() => {})
  }

  // ── Toggle recommendation ──
  async function toggleRecommendation(offerId: string) {
    const isCurrentlyRecommended = offers.find((o) => o.id === offerId)?.is_recommended

    const updated = offers.map((o) => ({
      ...o,
      is_recommended: o.id === offerId ? !isCurrentlyRecommended : false,
    }))
    setOffers(updated)
    lsSaveOffers(updated)

    // Sync to Supabase in background
    Promise.all(
      updated.map((o) =>
        fetch(`/api/offers/${o.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_recommended: o.is_recommended }),
        }),
      ),
    ).catch(() => {})
  }

  // ── Delete offer ──
  async function deleteOffer(offerId: string) {
    setOffers((prev) => { const next = prev.filter((o) => o.id !== offerId); lsSaveOffers(next); return next })
    fetch(`/api/offers?id=${offerId}`, { method: 'DELETE' }).catch(() => {})
  }

  // ── Save comparison ──
  async function save() {
    if (!comparison) return
    setSaving(true)
    const updated = { ...comparison, status: offers.length > 0 ? 'ready' : 'draft', updated_at: new Date().toISOString() }
    setComparison(updated)
    lsSaveComparison(updated)
    lsSaveOffers(offers)
    // Sync to Supabase
    fetch(`/api/comparisons?id=${comparison.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: updated.status, notes: comparison.notes }),
    }).catch(() => {})
    setSaving(false)
    showToast('Запазено')
  }

  // ── Share link ──
  async function handleShare() {
    if (sharing) return
    setSharing(true)
    try {
      const res = await fetch('/api/comparisons/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comparison_id: id }),
      })
      const data = await res.json()
      if (data.ok && data.shareToken) {
        const url = `${window.location.origin}/share/${data.shareToken}`
        setShareUrl(url)
        await navigator.clipboard.writeText(url)
        showToast('Линкът е копиран')
      } else {
        showToast('Грешка при генериране на линк')
      }
    } catch {
      showToast('Грешка при генериране на линк')
    } finally {
      setSharing(false)
    }
  }

  // ── Generate PDF ──
  async function generatePDF() {
    if (!comparison) return
    showToast('Генериране на PDF...')
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { ComparisonPDF } = await import('@/components/pdf/ComparisonPDF')
      const profile = { companyName: authProfile?.company_name ?? '', email: authProfile?.email ?? '' }
      const blob = await pdf(
        ComparisonPDF({
          clientName: comparison.client_name,
          insuranceClass: comparison.insurance_class,
          offers,
          brokerName: profile.email,
          brokerCompany: profile.companyName,
        }),
      ).toBlob()
      const url = URL.createObjectURL(blob)
      setPdfFileName(`Сравнение_${comparison.client_name || 'оферти'}.pdf`)
      setPdfPreviewUrl(url)
    } catch (err) {
      console.error('PDF generation failed:', err)
      showToast('Грешка при генериране на PDF')
    }
  }

  function downloadPdf() {
    if (!pdfPreviewUrl) return
    const a = document.createElement('a')
    a.href = pdfPreviewUrl
    a.download = pdfFileName
    a.click()
  }

  function closePdfPreview() {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
    setPdfPreviewUrl(null)
  }

  // ── Send to client ──
  async function sendToClient(email: string, name: string, message: string) {
    setShowSendModal(false)
    showToast('Изпращане...')
    try {
      const res = await fetch('/api/comparisons/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comparison_id: id,
          client_email: email,
          client_name: name || comparison?.client_name,
          message,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setComparison((prev) => prev ? { ...prev, status: 'sent' } : prev)
        showToast('Изпратено успешно')
      } else {
        console.error('[Send] API error:', data)
        showToast(data.error ?? `Грешка при изпращане (${res.status})`)
      }
    } catch (err) {
      console.error('[Send] Network error:', err)
      showToast('Грешка при връзка със сървъра')
    }
  }

  // ── Find lowest premium for auto-highlight ──
  const lowestPremiumId = offers.reduce<string | null>((best, o) => {
    if (!o.extracted_data?.premium_annual) return best
    const bestOffer = offers.find((x) => x.id === best)
    if (!bestOffer?.extracted_data?.premium_annual) return o.id
    return o.extracted_data.premium_annual < bestOffer.extracted_data.premium_annual ? o.id : best
  }, null)

  // Auto-set recommendation on lowest premium if none is set
  useEffect(() => {
    if (offers.length > 0 && !offers.some((o) => o.is_recommended) && lowestPremiumId) {
      toggleRecommendation(lowestPremiumId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers.length])

  // ── Unique coverages/exclusions/conditions ──
  const allCoverages = Array.from(new Set(offers.flatMap((o) => o.extracted_data?.coverages ?? [])))
  const allExclusions = Array.from(new Set(offers.flatMap((o) => o.extracted_data?.exclusions ?? [])))
  const allConditions = Array.from(new Set(offers.flatMap((o) => o.extracted_data?.special_conditions ?? [])))

  if (loading) {
    return <div className="p-8 text-center text-gray-400 text-sm">Зареждане...</div>
  }

  if (!comparison) {
    return <div className="p-8 text-center text-gray-400 text-sm">Сравнението не е намерено</div>
  }

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Send modal */}
      {showSendModal && <SendModal onClose={() => setShowSendModal(false)} onSend={sendToClient} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => router.push('/dashboard/comparisons')} className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900 truncate">
              Сравнение на оферти — {comparison.client_name || 'Нов клиент'} — {CLASS_LABELS[comparison.insurance_class] ?? comparison.insurance_class}
            </h1>
          </div>
          <p className="text-xs text-gray-500 ml-7">Качете получените оферти от застрахователите</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button onClick={() => fileInputRef.current?.click()} disabled={effectiveInsurers.length === 0 || uploading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {uploading ? 'Извличане...' : 'Добави оферта'}
          </button>
          <button onClick={generatePDF} disabled={offers.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Преглед PDF
          </button>
          <button onClick={async () => { const { exportComparisonToExcel } = await import('@/lib/exportComparison'); exportComparisonToExcel(comparison!, offers) }} disabled={offers.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Excel
          </button>
          <button onClick={handleShare} disabled={offers.length === 0 || sharing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            {sharing ? 'Генериране...' : 'Сподели'}
          </button>
          <button onClick={() => setShowSendModal(true)} disabled={offers.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Изпрати
          </button>
          <button onClick={save} disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
            {saving ? 'Запазване...' : 'Запази'}
          </button>
        </div>
      </div>

      {/* Upload area */}
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Застрахователи</label>
            <div className="flex flex-wrap gap-2">
              {INSURER_OPTIONS.filter((o) => o.value !== '__custom').map((o) => (
                <label
                  key={o.value}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm cursor-pointer transition-colors select-none',
                    selectedInsurers.has(o.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={selectedInsurers.has(o.value)}
                    onChange={() => toggleInsurer(o.value)}
                    className="sr-only"
                  />
                  {selectedInsurers.has(o.value) && (
                    <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {o.label}
                </label>
              ))}
              <label
                className={[
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm cursor-pointer transition-colors select-none',
                  hasCustom
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={hasCustom}
                  onChange={() => toggleInsurer('__custom')}
                  className="sr-only"
                />
                {hasCustom && (
                  <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Друг...
              </label>
            </div>
            {hasCustom && (
              <input
                type="text"
                value={customInsurer}
                onChange={(e) => setCustomInsurer(e.target.value)}
                placeholder="Въведете име на застраховател..."
                className="mt-2 w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none"
                autoFocus
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.eml,.png,.jpg,.jpeg"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={effectiveInsurers.length === 0 || uploading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors min-h-[38px]"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Извличане на данни...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Качи оферти ({effectiveInsurers.length > 0 ? effectiveInsurers.length : 0})
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400">PDF, Word, имейл, изображения • Може да изберете повече от един файл</p>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      {offers.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="sticky left-0 bg-gray-50 z-10 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[160px]">
                    &nbsp;
                  </th>
                  {offers.map((o) => (
                    <th
                      key={o.id}
                      className={[
                        'px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider min-w-[180px]',
                        o.is_recommended ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>{o.insurer_name}</span>
                        {typeof o.extracted_data?._detected_insurer === 'string' && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 normal-case tracking-normal">
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            имейл
                          </span>
                        )}
                        <button onClick={() => toggleRecommendation(o.id)} title="Препоръчай"
                          className={o.is_recommended ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}>
                          <svg className="h-4 w-4" fill={o.is_recommended ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                        </button>
                        <button onClick={() => deleteOffer(o.id)} title="Изтрий"
                          className="text-gray-300 hover:text-red-500 transition-colors">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {o.file_name && <p className="text-[10px] font-normal text-gray-400 mt-0.5 normal-case tracking-normal">{o.file_name}</p>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Score row */}
                <tr className="bg-gray-50/80">
                  <td className="sticky left-0 bg-gray-50/80 z-10 px-4 py-2 text-xs font-bold text-gray-700 border-r border-gray-100">
                    Оценка
                  </td>
                  {offers.map((o) => {
                    const score = scoreCoverage(o, offers)
                    const info = getScoreInfo(score)
                    return (
                      <td key={o.id} className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-100">
                            <div className="h-2 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: info.color }} />
                          </div>
                          <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: info.color }}>{score}</span>
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: info.color }}>{info.label}</span>
                      </td>
                    )
                  })}
                </tr>

                {/* Grouped fields */}
                {FIELD_GROUPS.map((group) => (
                  <React.Fragment key={group.label}>
                    <tr className="bg-gray-50/60">
                      <td colSpan={offers.length + 1} className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {group.label}
                      </td>
                    </tr>
                    {group.fields.map((field) => {
                      // Skip if no offer has this field
                      const anyHasValue = offers.some((o) => o.extracted_data?.[field.key] != null)
                      if (!anyHasValue && field.key !== 'premium_annual') return null
                      return (
                        <tr key={field.key} className="hover:bg-gray-50/50">
                          <td className="sticky left-0 bg-white z-10 px-4 py-2.5 text-xs font-semibold text-gray-700 border-r border-gray-100">
                            {field.label}
                          </td>
                          {offers.map((o) => {
                            const d = o.extracted_data ?? {}
                            let displayVal = ''
                            let isCalc = false

                            if (field.key === 'premium_annual' && d.premium_annual == null && typeof d.premium_rate_percent === 'number' && typeof d.insured_sum === 'number') {
                              // Calculate from rate
                              const calc = Math.round(d.insured_sum * d.premium_rate_percent / 100)
                              displayVal = `${d.premium_rate_percent}% ≈ ${calc.toLocaleString('bg-BG')} EUR`
                              isCalc = true
                            } else {
                              const val = d[field.key]
                              displayVal = val != null ? String(val) : ''
                            }

                            const isNull = !displayVal && (field.key === 'premium_annual' || field.key === 'premium_monthly')

                            return (
                              <td key={o.id} className={['px-3 py-1.5', isCalc ? 'bg-amber-50/50' : o.is_recommended ? 'bg-emerald-50/50' : ''].join(' ')}>
                                <EditableCell
                                  value={displayVal}
                                  type={field.type}
                                  isNull={isNull}
                                  isManuallyEdited={o.manually_edited}
                                  onChange={(v) => updateOfferField(o.id, String(field.key), v)}
                                />
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </React.Fragment>
                ))}

                {/* Coverages (expand/collapse) */}
                {allCoverages.length > 0 && (
                  <>
                    <tr className="bg-gray-50/80">
                      <td colSpan={offers.length + 1} className="px-4 py-2">
                        <button onClick={() => setExpandCoverages(!expandCoverages)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <svg className={`h-3 w-3 transition-transform ${expandCoverages ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                          Покрития ({allCoverages.length})
                        </button>
                      </td>
                    </tr>
                    {expandCoverages && allCoverages.map((cov, i) => {
                      const matchCount = offers.filter((o) => o.extracted_data?.coverages?.some((c) => c.toLowerCase().includes(cov.toLowerCase()))).length
                      const isUniversal = matchCount === offers.length
                      const isUnique = matchCount === 1
                      return (
                        <tr key={`cov-${i}`} className="hover:bg-gray-50/50">
                          <td className="sticky left-0 bg-white z-10 px-4 py-1.5 border-r border-gray-100">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              isUniversal ? 'bg-gray-100 text-gray-600' : isUnique ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {cov}
                              {!isUniversal && !isUnique && <span className="text-[9px] opacity-70">{matchCount}/{offers.length}</span>}
                              {isUnique && <span className="text-[9px]">само тук</span>}
                            </span>
                          </td>
                          {offers.map((o) => {
                            const has = o.extracted_data?.coverages?.some((c) => c.toLowerCase().includes(cov.toLowerCase()))
                            return (
                              <td key={o.id} className={['px-3 py-1.5 text-center text-xs', o.is_recommended ? 'bg-emerald-50/50' : ''].join(' ')}>
                                {has ? (
                                  <svg className="h-4 w-4 mx-auto text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </>
                )}

                {/* Exclusions (expand/collapse) */}
                {allExclusions.length > 0 && (
                  <>
                    <tr className="bg-gray-50/80">
                      <td colSpan={offers.length + 1} className="px-4 py-2">
                        <button onClick={() => setExpandExclusions(!expandExclusions)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <svg className={`h-3 w-3 transition-transform ${expandExclusions ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                          Изключения ({allExclusions.length})
                        </button>
                      </td>
                    </tr>
                    {expandExclusions && allExclusions.map((exc, i) => (
                      <tr key={`exc-${i}`} className="hover:bg-gray-50/50">
                        <td className="sticky left-0 bg-white z-10 px-4 py-1.5 text-[11px] text-gray-600 border-r border-gray-100">{exc}</td>
                        {offers.map((o) => (
                          <td key={o.id} className={['px-3 py-1.5 text-center text-xs', o.is_recommended ? 'bg-emerald-50/50' : ''].join(' ')}>
                            {o.extracted_data?.exclusions?.some((e) => e.toLowerCase().includes(exc.toLowerCase())) ? (
                              <span className="text-red-500 font-semibold">ДА</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}

                {/* Special conditions (expand/collapse) */}
                {allConditions.length > 0 && (
                  <>
                    <tr className="bg-gray-50/80">
                      <td colSpan={offers.length + 1} className="px-4 py-2">
                        <button onClick={() => setExpandConditions(!expandConditions)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <svg className={`h-3 w-3 transition-transform ${expandConditions ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                          Специални условия ({allConditions.length})
                        </button>
                      </td>
                    </tr>
                    {expandConditions && allConditions.map((cond, i) => (
                      <tr key={`cond-${i}`} className="hover:bg-gray-50/50">
                        <td className="sticky left-0 bg-white z-10 px-4 py-1.5 text-[11px] text-gray-600 border-r border-gray-100">{cond}</td>
                        {offers.map((o) => (
                          <td key={o.id} className={['px-3 py-1.5 text-center text-xs', o.is_recommended ? 'bg-emerald-50/50' : ''].join(' ')}>
                            {o.extracted_data?.special_conditions?.some((s) => s.toLowerCase().includes(cond.toLowerCase())) ? (
                              <span className="text-blue-600 font-semibold">ДА</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}

                {/* Smart recommendation row */}
                {(() => {
                  const scores = offers.map((o) => ({ id: o.id, score: scoreCoverage(o, offers), offer: o }))
                  const bestScore = Math.max(...scores.map((s) => s.score))
                  const bestOffer = scores.find((s) => s.score === bestScore)?.offer
                  return (
                    <tr className="bg-emerald-50/30 border-t-2 border-emerald-200">
                      <td className="sticky left-0 bg-emerald-50/30 z-10 px-4 py-3 text-xs font-bold text-emerald-700 border-r border-gray-100">
                        Препоръка
                      </td>
                      {offers.map((o) => {
                        const isBest = bestOffer?.id === o.id && bestScore >= 50
                        const isManual = o.is_recommended
                        return (
                          <td key={o.id} className={`px-3 py-3 text-center ${isBest && !isManual ? 'bg-emerald-50/80' : ''}`}>
                            {isManual ? (
                              <div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                  ⭐ ПРЕПОРЪЧАНА
                                </span>
                              </div>
                            ) : isBest ? (
                              <div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                                  {getRecommendationReason(o, offers)}
                                </span>
                                <button onClick={() => toggleRecommendation(o.id)} className="block mx-auto mt-1 text-[10px] text-emerald-600 hover:text-emerald-800 transition-colors">
                                  Потвърди
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => toggleRecommendation(o.id)} className="text-xs text-gray-400 hover:text-emerald-600 transition-colors">
                                Препоръчай
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {offers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <h3 className="mb-1 text-sm font-semibold text-gray-900">Качете първата оферта</h3>
          <p className="text-xs text-gray-400">Въведете името на застрахователя и качете файла с офертата</p>
        </div>
      )}

      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4" onClick={closePdfPreview}>
          <div className="bg-white w-full h-[95vh] sm:h-[85vh] sm:max-w-4xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{pdfFileName}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
                <button onClick={downloadPdf} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span className="hidden sm:inline">Изтегли</span>
                </button>
                <button onClick={closePdfPreview} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 overflow-auto">
              <object data={pdfPreviewUrl} type="application/pdf" className="w-full h-full hidden sm:block">
                <iframe src={pdfPreviewUrl} className="w-full h-full border-0" title="PDF Preview" />
              </object>
              <div className="flex sm:hidden flex-col items-center justify-center h-full px-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">PDF е готов</h3>
                <p className="text-sm text-gray-500 mb-5">{pdfFileName}</p>
                <button onClick={downloadPdf} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Изтегли PDF
                </button>
                <button onClick={closePdfPreview} className="mt-3 text-sm text-gray-500">Затвори</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
