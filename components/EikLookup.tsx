'use client'

import { parseAddress } from '@/lib/addressParser'

/**
 * Shared EIK lookup UI components — used by QuestionnaireForm and GLQuestionnaireForm.
 *
 * Exports:
 *   EikInput          — EIK text input with loading/found/not_found indicator
 *   CompanyNameInput  — Company name text input with autocomplete dropdown
 *   useEikLookup      — Hook: handles EIK → auto-fill all company fields
 */

import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type EikStatus = 'idle' | 'loading' | 'found' | 'not_found'

export interface EikData {
  company_name?: string
  address?: string
  city?: string
  email?: string
  phone?: string
  activity?: string
  nkid_code?: string
  representative?: string
  legalForm?: string
}

export interface CompanySearchResult {
  uic: string
  name: string
  legalForm: string
  status: string
}

// ─── Shared input class (can be overridden via className prop) ────────────────

const base =
  'w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm'

// ─── EikInput ────────────────────────────────────────────────────────────────

export function EikInput({
  value,
  onChange,
  status,
}: {
  value: string | number | undefined
  onChange: (v: string) => void
  status: EikStatus
}) {
  const borderClass =
    status === 'found'     ? ' border-green-400 pr-9' :
    status === 'not_found' ? ' border-amber-400 pr-9' :
    status === 'loading'   ? ' pr-9' : ''

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="123456789"
          maxLength={13}
          className={base + borderClass}
        />
        {status === 'loading' && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
        {status === 'found' && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'not_found' && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
        )}
      </div>
      {status === 'found' && (
        <p className="text-[12px] text-green-600 mt-1 flex items-center gap-1">
          <span>✓</span> Данните са заредени от Търговски регистър
        </p>
      )}
      {status === 'not_found' && (
        <p className="text-[12px] text-amber-600 mt-1">Не е намерен в ТР — попълнете ръчно</p>
      )}
      {status === 'loading' && (
        <p className="text-[12px] text-blue-500 mt-1">Търсене в Търговски регистър…</p>
      )}
    </div>
  )
}

// ─── CompanyNameInput ─────────────────────────────────────────────────────────

export function CompanyNameInput({
  value,
  onChange,
  onSelect,
  placeholder = 'Наименование на фирмата',
}: {
  value: string | number | undefined
  onChange: (v: string) => void
  onSelect: (data: EikData & { eik: string }) => void
  placeholder?: string
}) {
  const [results, setResults] = useState<CompanySearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const doSearch = async (q: string) => {
    if (!q || q.length < 3) { setResults([]); setOpen(false); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/eik/search?name=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        const r = data.results ?? []
        setResults(r)
        setOpen(r.length > 0)
      }
    } catch { /* ignore */ }
    setSearching(false)
  }

  const handleChange = (v: string) => {
    onChange(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(v), 350)
  }

  const handleSelect = async (item: CompanySearchResult) => {
    onChange(item.name)
    setOpen(false)
    try {
      const res = await fetch(`/api/eik?eik=${encodeURIComponent(item.uic)}`)
      if (res.ok) {
        const data: EikData = await res.json()
        onSelect({ ...data, company_name: item.name, eik: item.uic })
        return
      }
    } catch { /* ignore */ }
    onSelect({ company_name: item.name, eik: item.uic })
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={base + ' pr-9'}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
          {searching ? (
            <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          )}
        </div>
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((c) => (
            <li
              key={c.uic}
              onMouseDown={() => handleSelect(c)}
              className="px-4 py-2.5 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              <div className="font-medium truncate">{c.name}</div>
              <div className="text-xs text-gray-400">{c.legalForm} · ЕИК {c.uic}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── useEikLookup hook ────────────────────────────────────────────────────────

/**
 * Returns { eikStatus, handleEikChange, handleCompanySelect }
 *
 * Usage:
 *   const { eikStatus, handleEikChange, handleCompanySelect } = useEikLookup(setFormData)
 *
 * Field mapping (from EIKResult → form field id):
 *   company_name → companyNameFieldId  (e.g. 'company_name' or 'gl_company_name')
 *   address      → addressFieldId
 *   email        → emailFieldId
 *   phone        → phoneFieldId
 *   activity     → activityFieldId
 *   nkid_code    → nkidFieldId
 *   representative → representativeFieldId
 */
export interface EikFieldMap {
  eik: string
  company_name: string
  address: string
  city?: string              // If set, address from API will be split: city → this field, street → address field
  email?: string
  phone?: string
  activity?: string
  nkid_code?: string
  representative?: string
}

export function useEikLookup(
  setFormData: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void,
  fieldMap: EikFieldMap,
) {
  const [eikStatus, setEikStatus] = useState<EikStatus>('idle')
  const abortRef = useRef<AbortController | null>(null)

  const applyData = useCallback((eik: string, data: EikData) => {
    setFormData((prev) => ({
      ...prev,
      [fieldMap.eik]:                           eik,
      ...(data.company_name && fieldMap.company_name ? { [fieldMap.company_name]: data.company_name } : {}),
      ...(data.address && fieldMap.address ? (() => {
        if (fieldMap.city) {
          const parsed = parseAddress(data.address!)
          return {
            ...(parsed.city ? { [fieldMap.city]: parsed.city } : {}),
            [fieldMap.address]: parsed.street || data.address,
          }
        }
        return { [fieldMap.address]: data.address }
      })() : {}),
      ...(data.email        && fieldMap.email        ? { [fieldMap.email]:        data.email        } : {}),
      ...(data.phone        && fieldMap.phone        ? { [fieldMap.phone]:        data.phone        } : {}),
      ...(data.activity     && fieldMap.activity     ? { [fieldMap.activity]:     data.activity     } : {}),
      ...(data.nkid_code    && fieldMap.nkid_code    ? { [fieldMap.nkid_code]:    data.nkid_code    } : {}),
      ...(data.representative && fieldMap.representative ? { [fieldMap.representative]: data.representative } : {}),
    }))
  }, [setFormData, fieldMap])

  const lookupEik = useCallback(async (eik: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setEikStatus('loading')
    try {
      const res = await fetch(`/api/eik?eik=${encodeURIComponent(eik)}`, { signal: controller.signal })
      if (controller.signal.aborted) return
      if (res.ok) {
        const data: EikData = await res.json()
        if (data.company_name) {
          applyData(eik, data)
          setEikStatus('found')
          return
        }
      }
      setEikStatus('not_found')
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setEikStatus('not_found')
    }
  }, [applyData])

  const handleEikChange = useCallback((v: string) => {
    setFormData((prev) => ({ ...prev, [fieldMap.eik]: v }))
    const digits = v.replace(/\D/g, '')
    if (digits.length === 9 || digits.length === 13) {
      lookupEik(digits)
    } else {
      abortRef.current?.abort()
      setEikStatus('idle')
    }
  }, [fieldMap.eik, lookupEik, setFormData])

  const handleCompanySelect = useCallback((data: EikData & { eik: string }) => {
    applyData(data.eik, data)
    setEikStatus('found')
  }, [applyData])

  return { eikStatus, handleEikChange, handleCompanySelect }
}
