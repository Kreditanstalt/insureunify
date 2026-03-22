/**
 * Format an ISO date string (YYYY-MM-DD) as Bulgarian дд.мм.гггг г.
 * Returns the original string if it doesn't match ISO format.
 */
export function fmtDateBG(isoDate: string | number | undefined): string {
  if (!isoDate) return '—'
  const s = String(isoDate)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}.${m[2]}.${m[1]} г.` : s
}
