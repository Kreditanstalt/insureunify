/**
 * renewal.ts — Utility for submission renewal flow
 */

const RENEWAL_KEY = 'iu_renewal_data'

export interface RenewalData {
  renewedFromId: string
  insuranceClass: string
  selectedInsurers: string[]
  formData: Record<string, unknown>
}

/** Store renewal data in localStorage before navigating to form */
export function storeRenewalData(data: RenewalData): void {
  localStorage.setItem(RENEWAL_KEY, JSON.stringify(data))
}

/** Read and remove renewal data (one-time consumption) */
export function readRenewalData(): RenewalData | null {
  try {
    const raw = localStorage.getItem(RENEWAL_KEY)
    if (!raw) return null
    localStorage.removeItem(RENEWAL_KEY)
    return JSON.parse(raw) as RenewalData
  } catch {
    return null
  }
}

/** Get today in YYYY-MM-DD format */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Add months to a YYYY-MM-DD date string */
export function addMonthsISO(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

/** Map insurance_class to the form page URL */
export function classToFormUrl(cls: string): string {
  const map: Record<string, string> = {
    property:               '/dashboard/new/property',
    general_liability:      '/dashboard/new/general-liability',
    occupational_accident:  '/dashboard/new/occupational-accident',
    professional_liability: '/dashboard/new/professional-liability',
    trade_credit:           '/dashboard/new/trade-credit',
  }
  return map[cls] ?? '/dashboard/new/property'
}

/** Get the period field names for a given insurance class */
export function getPeriodFields(cls: string): { from: string; to: string } | null {
  const map: Record<string, { from: string; to: string }> = {
    property:               { from: 'period_from',    to: 'period_to' },
    general_liability:      { from: 'gl_period_from', to: 'gl_period_to' },
    occupational_accident:  { from: 'oa_period_from', to: 'oa_period_to' },
    professional_liability: { from: 'pl_period_from', to: 'pl_period_to' },
  }
  return map[cls] ?? null
}
