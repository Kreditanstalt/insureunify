import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlanInfo {
  plan_id: string
  plan_name: string
  trial_ends_at: string | null
  max_submissions_monthly: number | null
  max_insurers_per_submission: number | null
  account_id: string | null
}

export interface UsageInfo {
  submissions_count: number
  month: string
}

export interface LimitCheck {
  allowed: boolean
  reason?: 'trial_expired' | 'limit_reached'
  count?: number
  max?: number | null
}

// ─── Plan names ──────────────────────────────────────────────────────────────

export const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  trial: { label: 'Пробен', color: '#92400e', bg: '#fef3c7' },
  basic: { label: 'Basic', color: '#1e40af', bg: '#dbeafe' },
  pro:   { label: 'Pro',   color: '#6b21a8', bg: '#f3e8ff' },
}

// ─── Get current plan for a user ─────────────────────────────────────────────

export async function getAccountForUser(userId: string, supabase: SupabaseClient): Promise<{ accountId: string | null }> {
  const { data: bu } = await supabase
    .from('broker_users')
    .select('account_id')
    .eq('user_id', userId)
    .maybeSingle()
  return { accountId: bu?.account_id ?? null }
}

export async function getCurrentPlan(accountId: string, supabase: SupabaseClient): Promise<PlanInfo | null> {
  const { data } = await supabase
    .from('broker_accounts')
    .select('id, plan_id, trial_ends_at, plans(name, max_submissions_monthly, max_insurers_per_submission)')
    .eq('id', accountId)
    .single()

  if (!data) return null

  // plans may be object (single) or array (multiple) depending on FK type
  const rawPlan = data.plans as unknown
  const plan = Array.isArray(rawPlan) ? (rawPlan[0] as Record<string, unknown> | undefined) ?? null : rawPlan as Record<string, unknown> | null
  return {
    plan_id: String(data.plan_id ?? 'trial'),
    plan_name: String(plan?.name ?? data.plan_id ?? 'trial'),
    trial_ends_at: data.trial_ends_at ? String(data.trial_ends_at) : null,
    max_submissions_monthly: plan?.max_submissions_monthly != null ? Number(plan.max_submissions_monthly) : null,
    max_insurers_per_submission: plan?.max_insurers_per_submission != null ? Number(plan.max_insurers_per_submission) : null,
    account_id: accountId,
  }
}

// ─── Get usage for current month ─────────────────────────────────────────────

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7) // "2026-03"
}

export async function getMonthlyUsage(accountId: string, supabase: SupabaseClient): Promise<UsageInfo> {
  const month = currentMonth()
  const { data } = await supabase
    .from('usage_tracking')
    .select('submissions_count')
    .eq('account_id', accountId)
    .eq('month', month)
    .maybeSingle()

  return {
    submissions_count: data?.submissions_count ?? 0,
    month,
  }
}

// ─── Check submission limit ──────────────────────────────────────────────────

export async function checkSubmissionLimit(accountId: string, supabase: SupabaseClient): Promise<LimitCheck> {
  const planInfo = await getCurrentPlan(accountId, supabase)
  if (!planInfo) return { allowed: true }

  // Check trial expiry
  if (planInfo.plan_id === 'trial' && planInfo.trial_ends_at) {
    const trialEnd = new Date(planInfo.trial_ends_at)
    if (trialEnd < new Date()) {
      return { allowed: false, reason: 'trial_expired' }
    }
  }

  // Check monthly limit
  if (!planInfo.max_submissions_monthly) return { allowed: true }

  const usage = await getMonthlyUsage(accountId, supabase)
  if (usage.submissions_count >= planInfo.max_submissions_monthly) {
    return {
      allowed: false,
      reason: 'limit_reached',
      count: usage.submissions_count,
      max: planInfo.max_submissions_monthly,
    }
  }

  return { allowed: true, count: usage.submissions_count, max: planInfo.max_submissions_monthly }
}

// ─── Increment usage ─────────────────────────────────────────────────────────

export async function incrementUsage(accountId: string, supabase: SupabaseClient): Promise<void> {
  const month = currentMonth()

  // Upsert: increment if exists, insert with 1 if not
  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('id, submissions_count')
    .eq('account_id', accountId)
    .eq('month', month)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('usage_tracking')
      .update({ submissions_count: (existing.submissions_count ?? 0) + 1 })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('usage_tracking')
      .insert({ account_id: accountId, month, submissions_count: 1 })
  }
}

// ─── Check insurer limit ─────────────────────────────────────────────────────

export async function getMaxInsurers(accountId: string, supabase: SupabaseClient): Promise<number> {
  const planInfo = await getCurrentPlan(accountId, supabase)
  return planInfo?.max_insurers_per_submission ?? 4
}
