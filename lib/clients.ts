/**
 * clients.ts — Client Registry
 * Writes to both localStorage (cache) and Supabase via API
 */

import { v4 as uuidv4 } from 'uuid'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientProfile {
  id: string
  company_name: string
  eik?: string
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  mobile?: string
  email?: string
  website?: string
  activity?: string
  nkid_code?: string
  legal_form?: string
  year_founded?: string
  representative?: string
  representative_egn?: string
  annual_revenue?: number
  employees_count?: number
  annual_wage_fund?: number
  property_address?: string
  building_type?: string
  construction_type?: string
  roof_type?: string
  construction_year?: string
  floors?: string
  area_sqm?: number
  fire_alarm?: string
  sprinklers?: string
  security_system?: string
  notes?: string
  tags?: string[]
  last_submission_at?: string
  submissions_count?: number
  created_at: string
  updated_at: string
}

export interface ClientPrefillData {
  clientId: string
  company_name: string
  eik?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  activity?: string
  nkid_code?: string
  representative?: string
  employees_count?: number
  annual_wage_fund?: number
  annual_revenue?: number
  property_address?: string
  construction_type?: string
  roof_type?: string
  construction_year?: string
  floors?: string
  area_sqm?: number
  fire_alarm?: string
  sprinklers?: string
  security_system?: string
}

export interface SubmissionClientData {
  clientName: string
  eik?: string
  address?: string
  phone?: string
  email?: string
  activity?: string
  nkid_code?: string
  representative?: string
  insuranceClass?: string
  createdAt: string
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'iu_clients'
const PREFILL_KEY = 'iu_client_prefill'

export function getClients(): ClientProfile[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

export function saveClients(clients: ClientProfile[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
}

export function getClient(id: string): ClientProfile | null {
  return getClients().find((c) => c.id === id) ?? null
}

export function getClientByEik(eik: string): ClientProfile | null {
  if (!eik) return null
  return getClients().find((c) => c.eik === eik) ?? null
}

export function getClientByName(name: string): ClientProfile | null {
  if (!name) return null
  const lower = name.toLowerCase().trim()
  return getClients().find((c) => c.company_name.toLowerCase().trim() === lower) ?? null
}

// ─── Sync to Supabase ─────────────────────────────────────────────────────────

function syncToSupabase(client: ClientProfile): void {
  if (typeof window === 'undefined') return
  fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  }).catch(console.error)
}

function deleteFromSupabase(id: string): void {
  if (typeof window === 'undefined') return
  fetch('/api/clients', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  }).catch(console.error)
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function upsertClient(data: Partial<ClientProfile> & { company_name: string }): ClientProfile {
  const clients = getClients()
  const now = new Date().toISOString()

  let existing = data.eik ? clients.find((c) => c.eik === data.eik) : null
  if (!existing) existing = clients.find((c) => c.company_name.toLowerCase() === data.company_name.toLowerCase())

  if (existing) {
    const updated: ClientProfile = { ...existing, updated_at: now }
    const fields: (keyof ClientProfile)[] = [
      'eik', 'address', 'city', 'phone', 'email', 'activity',
      'nkid_code', 'representative', 'legal_form',
      'property_address', 'construction_type', 'roof_type', 'construction_year',
      'floors', 'fire_alarm', 'sprinklers', 'security_system',
    ]
    for (const f of fields) {
      if (!existing[f] && data[f]) (updated as unknown as Record<string, unknown>)[f] = data[f]
    }
    const numericFields: (keyof ClientProfile)[] = ['area_sqm', 'annual_revenue', 'employees_count', 'annual_wage_fund']
    for (const f of numericFields) {
      if (existing[f] == null && data[f] != null) (updated as unknown as Record<string, unknown>)[f] = data[f]
    }
    const idx = clients.findIndex((c) => c.id === existing!.id)
    clients[idx] = updated
    saveClients(clients)
    syncToSupabase(updated)
    return updated
  } else {
    const created: ClientProfile = {
      tags: [], submissions_count: 0,
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    }
    saveClients([created, ...clients])
    syncToSupabase(created)
    return created
  }
}

export function updateClient(id: string, patch: Partial<ClientProfile>): ClientProfile | null {
  const clients = getClients()
  const idx = clients.findIndex((c) => c.id === id)
  if (idx === -1) return null
  const updated = { ...clients[idx], ...patch, updated_at: new Date().toISOString() }
  clients[idx] = updated
  saveClients(clients)
  syncToSupabase(updated)
  return updated
}

export function deleteClient(id: string): void {
  saveClients(getClients().filter((c) => c.id !== id))
  deleteFromSupabase(id)
}

export function recordSubmissionForClient(eik: string | undefined, clientName: string, submissionDate: string): void {
  const clients = getClients()
  let client = eik ? clients.find((c) => c.eik === eik) : null
  if (!client) client = clients.find((c) => c.company_name.toLowerCase() === clientName.toLowerCase())
  if (!client) return
  const idx = clients.findIndex((c) => c.id === client!.id)
  clients[idx] = {
    ...client,
    submissions_count: (client.submissions_count ?? 0) + 1,
    last_submission_at: submissionDate,
    updated_at: new Date().toISOString(),
  }
  saveClients(clients)
  syncToSupabase(clients[idx])
}

// ─── Load from Supabase into localStorage ─────────────────────────────────────

export async function loadClientsFromSupabase(): Promise<void> {
  try {
    const res = await fetch('/api/clients')
    const { clients } = await res.json()
    if (clients?.length) {
      saveClients(clients)
    }
  } catch { /* network offline — localStorage is the truth */ }
}

// ─── Sync from submissions ─────────────────────────────────────────────────────

interface StoredSubmission {
  id: string; clientName: string; selectedInsurers: string[]
  insuranceClass?: string; formData: Record<string, unknown>; createdAt: string
}

function extractClientData(sub: StoredSubmission): Partial<ClientProfile> & { company_name: string } {
  const fd = sub.formData ?? {}
  const cls = sub.insuranceClass ?? 'property'
  const str = (v: unknown) => v ? String(v) : undefined
  const eik = str(cls === 'general_liability' ? fd.gl_eik : cls === 'occupational_accident' ? fd.oa_eik : cls === 'professional_liability' ? (fd.pl_eik ?? fd.pl_insured_eik) : cls === 'trade_credit' ? fd.tc_eik : fd.eik)
  const name = str(cls === 'general_liability' ? fd.gl_company_name : cls === 'occupational_accident' ? fd.oa_company_name : cls === 'professional_liability' ? fd.pl_company_name : cls === 'trade_credit' ? fd.tc_company_name : fd.company_name) ?? sub.clientName
  return {
    company_name: name,
    eik,
    address:        str(cls === 'general_liability' ? fd.gl_address : cls === 'occupational_accident' ? fd.oa_address : cls === 'professional_liability' ? fd.pl_address : fd.address),
    phone:          str(cls === 'general_liability' ? fd.gl_phone : cls === 'occupational_accident' ? fd.oa_phone : cls === 'professional_liability' ? fd.pl_phone : cls === 'trade_credit' ? fd.tc_phone : fd.phone),
    email:          str(cls === 'general_liability' ? fd.gl_email : cls === 'professional_liability' ? fd.pl_email : cls === 'trade_credit' ? fd.tc_email : fd.email),
    activity:       str(cls === 'general_liability' ? fd.gl_activity : cls === 'occupational_accident' ? fd.oa_activity : cls === 'professional_liability' ? fd.pl_activity : cls === 'trade_credit' ? fd.tc_activity : fd.activity),
    representative: str(cls === 'general_liability' ? fd.gl_representative : fd.representative),
  }
}

export function syncClientsFromSubmissions(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('iu_submissions')
    if (!raw) return
    const submissions: StoredSubmission[] = JSON.parse(raw)
    const countMap = new Map<string, { count: number; last: string }>()
    for (const sub of submissions) {
      const fd = sub.formData ?? {}
      const cls = sub.insuranceClass ?? 'property'
      const eik = String(cls === 'general_liability' ? fd.gl_eik : cls === 'occupational_accident' ? fd.oa_eik : cls === 'professional_liability' ? (fd.pl_eik ?? fd.pl_insured_eik) : fd.eik ?? '')
      const key = eik || sub.clientName.toLowerCase()
      const prev = countMap.get(key)
      countMap.set(key, { count: (prev?.count ?? 0) + 1, last: !prev || sub.createdAt > prev.last ? sub.createdAt : prev.last })
    }
    for (const sub of submissions) {
      const data = extractClientData(sub)
      const client = upsertClient(data)
      const key = data.eik ?? data.company_name.toLowerCase()
      const stats = countMap.get(key)
      if (stats) updateClient(client.id, { submissions_count: stats.count, last_submission_at: stats.last })
    }
  } catch (err) { console.error('syncClientsFromSubmissions:', err) }
}

// ─── Prefill ──────────────────────────────────────────────────────────────────

export function storePrefill(data: ClientPrefillData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREFILL_KEY, JSON.stringify(data))
}

export function readPrefill(): ClientPrefillData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PREFILL_KEY)
    if (!raw) return null
    localStorage.removeItem(PREFILL_KEY)
    return JSON.parse(raw) as ClientPrefillData
  } catch { return null }
}

export function mapPrefillToFormFields(
  prefill: ClientPrefillData,
  insuranceClass: 'property' | 'general_liability' | 'occupational_accident' | 'professional_liability',
): Record<string, string> {
  switch (insuranceClass) {
    case 'general_liability': return {
      gl_company_name: prefill.company_name, gl_eik: prefill.eik ?? '',
      gl_address: prefill.address ?? '', gl_phone: prefill.phone ?? '',
      gl_email: prefill.email ?? '', gl_activity: prefill.activity ?? '',
      gl_activity_code: prefill.nkid_code ?? '', gl_representative: prefill.representative ?? '',
    }
    case 'occupational_accident': return {
      oa_company_name: prefill.company_name, oa_eik: prefill.eik ?? '',
      oa_address: prefill.address ?? '', oa_phone: prefill.phone ?? '',
      oa_activity: prefill.activity ?? '', oa_activity_code: prefill.nkid_code ?? '',
      oa_employees_count: prefill.employees_count ? String(prefill.employees_count) : '',
      oa_annual_wage_fund: prefill.annual_wage_fund ? String(prefill.annual_wage_fund) : '',
    }
    case 'professional_liability': return {
      pl_company_name: prefill.company_name, pl_eik: prefill.eik ?? '',
      pl_address: prefill.address ?? '', pl_phone: prefill.phone ?? '',
      pl_email: prefill.email ?? '', pl_activity: prefill.activity ?? '',
      pl_employees_count: prefill.employees_count ? String(prefill.employees_count) : '',
    }
    default: return {
      company_name: prefill.company_name, eik: prefill.eik ?? '',
      address: prefill.address ?? '', phone: prefill.phone ?? '',
      email: prefill.email ?? '', activity: prefill.activity ?? '',
      nkid_code: prefill.nkid_code ?? '', representative: prefill.representative ?? '',
      property_address: prefill.property_address ?? '', construction_type: prefill.construction_type ?? '',
      roof_type: prefill.roof_type ?? '', construction_year: prefill.construction_year ?? '',
      floors: prefill.floors ?? '', area_sqm: prefill.area_sqm != null ? String(prefill.area_sqm) : '',
      fire_alarm: prefill.fire_alarm ?? '', sprinklers: prefill.sprinklers ?? '',
      security_system: prefill.security_system ?? '',
    }
  }
}
