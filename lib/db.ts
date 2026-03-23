/**
 * db.ts — Unified data layer
 * Reads/writes to Supabase when configured, falls back to localStorage
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const isConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON)

// Client-side client (anon key)
let _client: SupabaseClient | null = null
export function getClient(): SupabaseClient | null {
  if (!isConfigured()) return null
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_ANON)
  return _client
}

// Server-side client (service role — only for API routes)
export function getServiceClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE) return null
  return createClient(SUPABASE_URL, SUPABASE_SERVICE)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbSubmission {
  id: string
  client_name: string
  insurance_class?: string
  selected_insurers: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form_data: Record<string, any>
  created_at: string
  updated_at?: string
}

export interface DbClient {
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
  submissions_count?: number
  last_submission_at?: string
  created_at: string
  updated_at: string
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export async function saveSubmission(sub: DbSubmission): Promise<void> {
  const db = getClient()
  if (db) {
    await db.from('submissions').upsert({
      id:                sub.id,
      client_name:       sub.client_name,
      insurance_class:   sub.insurance_class,
      selected_insurers: sub.selected_insurers,
      form_data:         sub.form_data,
    })
  }
  // Always also save to localStorage as cache/fallback
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('iu_submissions') ?? '[]'
    const existing = JSON.parse(raw) as DbSubmission[]
    const updated = [sub, ...existing.filter((s) => s.id !== sub.id)]
    localStorage.setItem('iu_submissions', JSON.stringify(updated))
  }
}

export async function getSubmissions(): Promise<DbSubmission[]> {
  const db = getClient()
  if (db) {
    const { data, error } = await db
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      // Sync to localStorage cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('iu_submissions', JSON.stringify(data))
      }
      return data as DbSubmission[]
    }
  }
  // Fallback: localStorage
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('iu_submissions') ?? '[]'
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

export async function getSubmission(id: string): Promise<DbSubmission | null> {
  const db = getClient()
  if (db) {
    const { data, error } = await db
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()
    if (!error && data) return data as DbSubmission
  }
  // Fallback
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('iu_submissions') ?? '[]'
    try {
      const all: DbSubmission[] = JSON.parse(raw)
      return all.find((s) => s.id === id) ?? null
    } catch { return null }
  }
  return null
}

export async function deleteSubmission(id: string): Promise<void> {
  const db = getClient()
  if (db) await db.from('submissions').delete().eq('id', id)
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('iu_submissions') ?? '[]'
    try {
      const all: DbSubmission[] = JSON.parse(raw)
      localStorage.setItem('iu_submissions', JSON.stringify(all.filter((s) => s.id !== id)))
    } catch { /* ignore */ }
  }
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function saveClientToDb(client: DbClient): Promise<void> {
  const db = getClient()
  if (db) {
    await db.from('clients').upsert({
      ...client,
      tags: client.tags ?? [],
    })
  }
}

export async function getClientsFromDb(): Promise<DbClient[]> {
  const db = getClient()
  if (db) {
    const { data, error } = await db
      .from('clients')
      .select('*')
      .order('updated_at', { ascending: false })
    if (!error && data) return data as DbClient[]
  }
  return []
}

export async function getClientFromDb(id: string): Promise<DbClient | null> {
  const db = getClient()
  if (db) {
    const { data, error } = await db
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    if (!error && data) return data as DbClient
  }
  return null
}

export async function deleteClientFromDb(id: string): Promise<void> {
  const db = getClient()
  if (db) await db.from('clients').delete().eq('id', id)
}

// ─── Migration: localStorage → Supabase ──────────────────────────────────────

export async function migrateLocalStorageToSupabase(): Promise<{ submissions: number; clients: number }> {
  const db = getClient()
  if (!db || typeof window === 'undefined') return { submissions: 0, clients: 0 }

  let migratedSubs = 0
  let migratedClients = 0

  // Migrate submissions
  try {
    const raw = localStorage.getItem('iu_submissions')
    if (raw) {
      const subs: DbSubmission[] = JSON.parse(raw)
      if (subs.length > 0) {
        const { error } = await db.from('submissions').upsert(
          subs.map((s) => ({
            id:                s.id,
            client_name:       s.client_name,
            insurance_class:   s.insurance_class,
            selected_insurers: s.selected_insurers ?? [],
            form_data:         s.form_data ?? {},
            created_at:        s.created_at,
          })),
          { onConflict: 'id', ignoreDuplicates: true }
        )
        if (!error) migratedSubs = subs.length
      }
    }
  } catch (e) { console.error('Migration submissions error:', e) }

  // Migrate clients
  try {
    const raw = localStorage.getItem('iu_clients')
    if (raw) {
      const clients: DbClient[] = JSON.parse(raw)
      if (clients.length > 0) {
        const { error } = await db.from('clients').upsert(
          clients.map((c) => ({ ...c, tags: c.tags ?? [] })),
          { onConflict: 'id', ignoreDuplicates: true }
        )
        if (!error) migratedClients = clients.length
      }
    }
  } catch (e) { console.error('Migration clients error:', e) }

  return { submissions: migratedSubs, clients: migratedClients }
}
