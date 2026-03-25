/**
 * useAuth.ts — Re-exports from AuthProvider for backward compatibility.
 *
 * All components that import { useAuth } from '@/lib/useAuth' will now
 * get the Context-based hook instead of creating independent state.
 */
export { useAuth } from './AuthProvider'
export type { BrokerProfile, PlanData, UsageData, AuthContextValue } from './AuthProvider'
