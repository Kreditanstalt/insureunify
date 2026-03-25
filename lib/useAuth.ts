'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

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
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<BrokerProfile | null>(null)
  const [loading, setLoading] = useState(true)

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

        // Try to load profile from broker_profiles first, then broker_accounts
        let profileData: Record<string, unknown> | null = null

        // Try broker_profiles (our table)
        const { data: bp } = await supabase
          .from('broker_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (bp) {
          profileData = bp
        } else {
          // Try broker_users → broker_accounts (user's custom tables)
          const { data: bu } = await supabase
            .from('broker_users')
            .select('*, broker_accounts(*)')
            .eq('user_id', session.user.id)
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
              subscription_plan: account?.plan_id ? 'active' : 'trial',
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
          })
        } else {
          // No profile found in any table — create a minimal one from user metadata
          const meta = session.user.user_metadata
          setProfile({
            id: session.user.id,
            company_name: meta?.company_name ?? session.user.email?.split('@')[0] ?? 'Моята компания',
            email: session.user.email ?? '',
            subscription_plan: 'trial',
          })
        }
      } catch (err) {
        console.error('[useAuth] Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        setProfile(null)
      } else {
        setUser(session.user)
        // Reload profile when auth state changes
        if (_event === 'SIGNED_IN') {
          load()
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return { user, profile, loading, signOut, setProfile }
}
