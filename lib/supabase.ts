import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// ─── Browser client (for client components) ──────────────────────────────────

let _browser: SupabaseClient | null = null

export function getBrowserClient(): SupabaseClient {
  if (!_browser) {
    _browser = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return _browser
}

// Legacy alias — used by many existing components
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getBrowserClient() as unknown as Record<string, unknown>)[prop as string]
  },
})

// ─── Server client (service role — for API routes only) ──────────────────────

export function createServerClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for server client')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
