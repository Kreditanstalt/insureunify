'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { saveDraft, loadDraft, deleteDraft, cleanupExpiredDrafts, timeAgo } from '@/lib/drafts'
import type { InsuranceClass, Draft } from '@/lib/drafts'

interface UseDraftAutoSaveOptions {
  insuranceClass: InsuranceClass
  formData: Record<string, unknown>
  selectedInsurers: string[]
  currentSection: number
  eikField: string                // key in formData for the EIK value
  clientNameField: string         // key in formData for the company name
  enabled?: boolean               // default true
}

interface UseDraftAutoSaveReturn {
  /** The draft found on mount (if any), null once dismissed */
  pendingDraft: Draft | null
  /** Accept and restore the pending draft */
  restoreDraft: () => { formData: Record<string, unknown>; selectedInsurers: string[]; currentSection: number }
  /** Dismiss the pending draft and start fresh */
  dismissDraft: () => void
  /** Indicator text: "Запазване..." | "Запазено ✓" | "Последно запазено: преди X мин." | null */
  saveStatus: string | null
  /** Call on successful form submit to delete draft */
  clearDraft: () => void
  /** Force-save now (called on section change) */
  saveNow: () => void
}

const AUTO_SAVE_INTERVAL = 30_000 // 30 seconds

export function useDraftAutoSave(opts: UseDraftAutoSaveOptions): UseDraftAutoSaveReturn {
  const {
    insuranceClass,
    formData,
    selectedInsurers,
    currentSection,
    eikField,
    clientNameField,
    enabled = true,
  } = opts

  const [pendingDraft, setPendingDraft] = useState<Draft | null>(null)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  // Keep refs to always have latest values in callbacks/timers
  const formDataRef = useRef(formData)
  const selectedInsurersRef = useRef(selectedInsurers)
  const currentSectionRef = useRef(currentSection)
  formDataRef.current = formData
  selectedInsurersRef.current = selectedInsurers
  currentSectionRef.current = currentSection

  const eik = String(formData[eikField] ?? '')
  const clientName = String(formData[clientNameField] ?? '')
  const eikRef = useRef(eik)
  const clientNameRef = useRef(clientName)
  eikRef.current = eik
  clientNameRef.current = clientName

  // ── Cleanup expired on mount ──
  useEffect(() => {
    cleanupExpiredDrafts()
  }, [])

  // ── Check for existing draft on mount ──
  useEffect(() => {
    if (!enabled) return
    const draft = loadDraft(insuranceClass)
    if (draft && Object.keys(draft.formData).length > 0) {
      setPendingDraft(draft)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Save function ──
  const doSave = useCallback(() => {
    if (!enabled) return
    const fd = formDataRef.current
    // Don't save completely empty forms
    const hasData = Object.values(fd).some((v) => v !== '' && v !== undefined && v !== null)
    if (!hasData) return

    setSaveStatus('Запазване...')
    const currentEik = eikRef.current
    saveDraft({
      insuranceClass,
      formData: fd as Record<string, unknown>,
      selectedInsurers: selectedInsurersRef.current,
      currentSection: currentSectionRef.current,
      eik: currentEik || undefined,
      clientName: clientNameRef.current || undefined,
    })
    const now = new Date().toISOString()
    setLastSavedAt(now)
    // Brief "saving" then "saved" indicator
    setTimeout(() => {
      setSaveStatus('Запазено ✓')
      setTimeout(() => {
        setSaveStatus(null)
      }, 2000)
    }, 400)
  }, [enabled, insuranceClass])

  // ── Auto-save interval ──
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(doSave, AUTO_SAVE_INTERVAL)
    return () => clearInterval(id)
  }, [doSave, enabled])

  // ── Update relative time display ──
  useEffect(() => {
    if (!lastSavedAt || saveStatus) return
    const id = setInterval(() => {
      // Force re-render by setting status (will be null if not saving)
      setSaveStatus(null)
    }, 30_000)
    return () => clearInterval(id)
  }, [lastSavedAt, saveStatus])

  // ── Computed status text ──
  const displayStatus = saveStatus ?? (lastSavedAt ? `Последно запазено: ${timeAgo(lastSavedAt)}` : null)

  // ── Restore draft ──
  const restoreDraft = useCallback(() => {
    if (!pendingDraft) return { formData: {}, selectedInsurers: [], currentSection: 0 }
    const result = {
      formData: pendingDraft.formData,
      selectedInsurers: pendingDraft.selectedInsurers,
      currentSection: pendingDraft.currentSection,
    }
    setPendingDraft(null)
    return result
  }, [pendingDraft])

  // ── Dismiss draft ──
  const dismissDraft = useCallback(() => {
    if (pendingDraft) {
      // Delete the old draft
      deleteDraft(insuranceClass, pendingDraft.eik)
    }
    setPendingDraft(null)
  }, [pendingDraft, insuranceClass])

  // ── Clear draft on submit ──
  const clearDraft = useCallback(() => {
    deleteDraft(insuranceClass, eikRef.current || undefined)
    deleteDraft(insuranceClass) // also clear unsaved key
    setLastSavedAt(null)
    setSaveStatus(null)
  }, [insuranceClass])

  return {
    pendingDraft,
    restoreDraft,
    dismissDraft,
    saveStatus: displayStatus,
    clearDraft,
    saveNow: doSave,
  }
}
