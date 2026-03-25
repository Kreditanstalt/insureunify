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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      setUser(session.user)

      // Load broker profile
      const { data: profileData } = await supabase
        .from('broker_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      } else {
        // Auto-create profile if missing (e.g., user signed up but profile not created yet)
        const meta = session.user.user_metadata
        const newProfile = {
          id: session.user.id,
          company_name: meta?.company_name ?? session.user.email?.split('@')[0] ?? 'Моята компания',
          email: session.user.email ?? '',
        }
        await supabase.from('broker_profiles').upsert(newProfile)
        setProfile(newProfile)
      }

      setLoading(false)
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        setProfile(null)
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return { user, profile, loading, signOut, setProfile }
}
