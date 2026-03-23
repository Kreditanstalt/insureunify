'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getClient, getClients, storePrefill, type ClientProfile } from '@/lib/clients'

interface Props {
  insuranceClass: 'property' | 'general_liability' | 'occupational_accident' | 'professional_liability'
}

export default function ClientPickerBar({ insuranceClass: _insuranceClass }: Props) {
  const searchParams = useSearchParams()
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ClientProfile[]>([])
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // When arriving via ?client=<id> (navigated from client profile page):
  // The client profile already stored prefill in localStorage before navigating.
  // We just show the banner — no reload needed, form reads prefill on mount.
  useEffect(() => {
    const clientId = searchParams.get('client')
    if (!clientId) return
    const client = getClient(clientId)
    if (client) setSelectedClient(client)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function doSearch(q: string) {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    const lower = q.toLowerCase()
    const found = getClients().filter(
      (c) =>
        c.company_name.toLowerCase().includes(lower) ||
        (c.eik ?? '').includes(lower),
    ).slice(0, 8)
    setResults(found)
    setOpen(found.length > 0)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(v), 200)
  }

  // Manual picker selection: store prefill then navigate to URL without ?client=
  // so the page reloads once (form reads prefill on mount) without looping.
  function handleSelect(client: ClientProfile) {
    setQuery('')
    setOpen(false)
    storePrefill({
      clientId:        client.id,
      company_name:    client.company_name,
      eik:             client.eik,
      address:         client.address,
      city:            client.city,
      phone:           client.phone,
      email:           client.email,
      activity:        client.activity,
      nkid_code:       client.nkid_code,
      representative:  client.representative,
      employees_count:  client.employees_count,
      annual_wage_fund: client.annual_wage_fund,
      annual_revenue:   client.annual_revenue,
    })
    // Navigate to the same path WITHOUT ?client= so there's no loop on reload
    window.location.href = window.location.pathname
  }

  if (dismissed) return null

  return (
    <div className="sticky top-[57px] z-10 mx-auto max-w-2xl px-4">
      {selectedClient ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800">
            <svg className="h-4 w-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>
              Данни заредени от профил на{' '}
              <span className="font-semibold">{selectedClient.company_name}</span>
              {selectedClient.eik && (
                <span className="text-emerald-600 ml-1">(ЕИК: {selectedClient.eik})</span>
              )}
            </span>
          </div>
          <button
            onClick={() => { setSelectedClient(null); setDismissed(false) }}
            className="text-emerald-600 hover:text-emerald-800 transition-colors"
            title="Изчисти"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div ref={wrapRef} className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleChange}
              onFocus={() => query && doSearch(query)}
              placeholder="Избери клиент (по наименование или ЕИК)…"
              className="flex-1 border-none bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
            />
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-300 hover:text-gray-500 transition-colors"
              title="Затвори"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {open && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden max-h-64 overflow-y-auto">
              {results.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelect(client)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                    {client.company_name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{client.company_name}</p>
                    {client.eik && <p className="text-xs text-gray-400 font-mono">ЕИК: {client.eik}</p>}
                  </div>
                  {(client.submissions_count ?? 0) > 0 && (
                    <span className="text-xs text-gray-400">{client.submissions_count} запитв.</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
