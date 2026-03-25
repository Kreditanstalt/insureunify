'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { getBrowserClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// ─── Types (re-exported for consumers) ───────────────────────────────────────

export interface BrokerProfile {
  id: string
  company_name: string
  email: string
  phone?: string
  address?: string
  logo_url?: string
  brand_color?: string
  subscription_plan?: string
  trial_ends_at?: string
  is_active?: boolean
  account_id?: string
}

export interface PlanData {
  plan_id: string
  plan_name: string
  trial_ends_at: string | null
  max_submissions_monthly: number | null
  max_insurers_per_submission: number | null
}

export interface UsageData {
  submissions_count: number
  month: string
}

export interface AuthContextValue {
  user: User | null
  profile: BrokerProfile | null
  plan: PlanData | null
  usage: UsageData | null
  loading: boolean
  trialDaysLeft: number | null
  isTrialExpired: boolean
  signOut: () => Promise<void>
  setProfile: (p: BrokerProfile | null) => void
  refreshUsage: () => Promise<void>
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    // Fallback for components rendered outside provider (login, register, etc.)
    return {
      user: null, profile: null, plan: null, usage: null,
      loading: true, trialDaysLeft: null, isTrialExpired: false,
      signOut: async () => { window.location.href = '/login' },
      setProfile: () => {},
      refreshUsage: async () => {},
    }
  }
  return ctx
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<BrokerProfile | null>(null)
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadPlanData = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/account/plan?user_id=${userId}`)
      const data = await res.json()
      if (data.plan) setPlan(data.plan)
      if (data.usage) setUsage(data.usage)
    } catch { /* non-critical */ }
  }, [])

  const refreshUsage = useCallback(async () => {
    if (user) await loadPlanData(user.id)
  }, [user, loadPlanData])

  useEffect(() => {
    const supabase = getBrowserClient()

    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setLoading(false)
          return
        }

        setUser(session.user)

        // Load profile: broker_profiles first, then broker_users → broker_accounts
        let profileData: Record<string, unknown> | null = null

        const { data: bp } = await supabase
          .from('broker_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (bp) {
          profileData = bp
        } else {
          const { data: bu } = await supabase
            .from('broker_users')
            .select('*, broker_accounts(*)')
            .eq('id', session.user.id)
            .maybeSingle()

          if (bu) {
            const account = (bu as Record<string, unknown>).broker_accounts as Record<string, unknown> | null
            profileData = {
              id: session.user.id,
              company_name: account?.company_name ?? account?.name ?? session.user.email?.split('@')[0],
              email: session.user.email ?? '',
              phone: account?.phone ?? null,
              address: account?.address ?? null,
              logo_url: account?.logo_url ?? null,
              subscription_plan: account?.plan_id ?? 'trial',
              trial_ends_at: account?.trial_ends_at ?? null,
              account_id: bu.account_id ?? null,
            }
          }
        }

        if (profileData) {
          setProfile({
            id: String(profileData.id ?? session.user.id),
            company_name: String(profileData.company_name ?? session.user.email?.split('@')[0] ?? 'Моята компания'),
            email: String(profileData.email ?? session.user.email ?? ''),
            phone: profileData.phone ? String(profileData.phone) : undefined,
            address: profileData.address ? String(profileData.address) : undefined,
            logo_url: profileData.logo_url ? String(profileData.logo_url) : undefined,
            brand_color: profileData.brand_color ? String(profileData.brand_color) : undefined,
            subscription_plan: profileData.subscription_plan ? String(profileData.subscription_plan) : 'trial',
            trial_ends_at: profileData.trial_ends_at ? String(profileData.trial_ends_at) : undefined,
            is_active: profileData.is_active !== false,
            account_id: profileData.account_id ? String(profileData.account_id) : undefined,
          })
        } else {
          const meta = session.user.user_metadata
          setProfile({
            id: session.user.id,
            company_name: meta?.company_name ?? session.user.email?.split('@')[0] ?? 'Моята компания',
            email: session.user.email ?? '',
            subscription_plan: 'trial',
          })
        }

        loadPlanData(session.user.id)
      } catch (err) {
        console.error('[AuthProvider] Error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        setProfile(null)
        setPlan(null)
        setUsage(null)
      } else {
        setUser(session.user)
        if (_event === 'SIGNED_IN') load()
      }
    })

    return () => subscription.unsubscribe()
  }, [loadPlanData])

  const signOut = useCallback(async () => {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [])

  const trialDaysLeft = plan?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(plan.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null
  const isTrialExpired = plan?.plan_id === 'trial' && trialDaysLeft !== null && trialDaysLeft <= 0

  return (
    <AuthContext.Provider value={{
      user, profile, plan, usage, loading,
      trialDaysLeft, isTrialExpired,
      signOut, setProfile, refreshUsage,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
