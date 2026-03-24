/**
 * drafts.ts — Auto-save draft system for questionnaire forms
 */

export type InsuranceClass = 'property' | 'general_liability' | 'occupational_accident' | 'professional_liability' | 'trade_credit'

export interface Draft {
  key: string
  insuranceClass: InsuranceClass
  formData: Record<string, unknown>
  selectedInsurers: string[]
  currentSection: number
  clientName?: string
  eik?: string
  savedAt: string // ISO date
}

const DRAFT_PREFIX = 'iu_draft_'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

// ─── Key helpers ─────────────────────────────────────────────────────────────

export function draftKey(insuranceClass: InsuranceClass, eik?: string): string {
  return `${DRAFT_PREFIX}${insuranceClass}_${eik || 'unsaved'}`
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export function saveDraft(draft: Omit<Draft, 'key' | 'savedAt'>): string {
  if (typeof window === 'undefined') return ''
  const key = draftKey(draft.insuranceClass, draft.eik)
  const full: Draft = { ...draft, key, savedAt: new Date().toISOString() }
  localStorage.setItem(key, JSON.stringify(full))
  return key
}

export function loadDraft(insuranceClass: InsuranceClass, eik?: string): Draft | null {
  if (typeof window === 'undefined') return null
  try {
    // Try with EIK first, then unsaved
    const keys = eik
      ? [draftKey(insuranceClass, eik), draftKey(insuranceClass)]
      : [draftKey(insuranceClass)]

    for (const k of keys) {
      const raw = localStorage.getItem(k)
      if (!raw) continue
      const draft = JSON.parse(raw) as Draft
      // Check if expired
      if (Date.now() - new Date(draft.savedAt).getTime() > MAX_AGE_MS) {
        localStorage.removeItem(k)
        continue
      }
      return draft
    }
    return null
  } catch { return null }
}

export function deleteDraft(insuranceClass: InsuranceClass, eik?: string): void {
  if (typeof window === 'undefined') return
  // Delete both possible keys
  localStorage.removeItem(draftKey(insuranceClass, eik))
  localStorage.removeItem(draftKey(insuranceClass))
}

// ─── List all drafts ─────────────────────────────────────────────────────────

export function getAllDrafts(): Draft[] {
  if (typeof window === 'undefined') return []
  const drafts: Draft[] = []
  const now = Date.now()
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(DRAFT_PREFIX)) continue
    try {
      const draft = JSON.parse(localStorage.getItem(key)!) as Draft
      if (now - new Date(draft.savedAt).getTime() > MAX_AGE_MS) {
        localStorage.removeItem(key)
        continue
      }
      drafts.push({ ...draft, key })
    } catch {
      localStorage.removeItem(key!)
    }
  }
  return drafts.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
}

// ─── Cleanup expired ─────────────────────────────────────────────────────────

export function cleanupExpiredDrafts(): void {
  if (typeof window === 'undefined') return
  const now = Date.now()
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(DRAFT_PREFIX)) continue
    try {
      const draft = JSON.parse(localStorage.getItem(key)!) as Draft
      if (now - new Date(draft.savedAt).getTime() > MAX_AGE_MS) {
        toRemove.push(key)
      }
    } catch {
      toRemove.push(key!)
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k))
}

// ─── Class metadata ──────────────────────────────────────────────────────────

export const CLASS_META: Record<InsuranceClass, { icon: string; label: string; href: string }> = {
  property:               { icon: '🏢', label: 'Имущество',         href: '/dashboard/new/property' },
  professional_liability: { icon: '⚖️', label: 'Проф. отговорност', href: '/dashboard/new/professional-liability' },
  general_liability:      { icon: '🔧', label: 'ОГО',               href: '/dashboard/new/general-liability' },
  occupational_accident:  { icon: '⚡', label: 'Трудова злополука', href: '/dashboard/new/occupational-accident' },
  trade_credit:           { icon: '💳', label: 'Търговски кредит',  href: '/dashboard/new/trade-credit' },
}

// ─── Relative time formatter ─────────────────────────────────────────────────

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return 'току-що'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `преди ${mins} мин.`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `преди ${hours} ч.`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'вчера'
  return `преди ${days} дни`
}
