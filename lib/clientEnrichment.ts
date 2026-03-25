/**
 * clientEnrichment.ts — Enrich form data from previous submissions for the same client (EIK).
 *
 * When a user enters an EIK that matches a previous submission,
 * auto-fill fields that weren't returned by CompanyBook API
 * (e.g., property details, fire safety, security, building info).
 */

interface SubmissionRecord {
  id: string
  client_name?: string
  insurance_class?: string
  form_data?: Record<string, unknown>
  created_at?: string
}

/**
 * Find the most recent submission for the given EIK and insurance class.
 * Searches localStorage first (fast), then falls back to API.
 */
export function findPreviousSubmission(
  eik: string,
  insuranceClass: string,
): Record<string, unknown> | null {
  if (!eik || typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem('iu_submissions')
    if (!raw) return null

    const submissions: SubmissionRecord[] = JSON.parse(raw)

    // Find most recent submission with matching EIK and class
    const match = submissions
      .filter((s) => {
        const fd = s.form_data ?? {}
        const sEik = String(fd.eik ?? fd.gl_eik ?? fd.oa_eik ?? fd.pl_eik ?? fd.tc_eik ?? '')
        return sEik === eik && (s.insurance_class === insuranceClass || !insuranceClass)
      })
      .sort((a, b) => {
        const da = new Date(a.created_at ?? 0).getTime()
        const db = new Date(b.created_at ?? 0).getTime()
        return db - da
      })[0]

    return match?.form_data ?? null
  } catch {
    return null
  }
}

/**
 * Merge previous submission data into current form data.
 * Only fills empty fields — does NOT overwrite user-entered values.
 */
export function enrichFromPrevious(
  currentData: Record<string, unknown>,
  previousData: Record<string, unknown>,
  fieldsToEnrich?: string[],
): { enriched: Record<string, unknown>; enrichedFields: string[] } {
  const enriched = { ...currentData }
  const enrichedFields: string[] = []

  const keys = fieldsToEnrich ?? Object.keys(previousData)

  for (const key of keys) {
    // Skip if current form already has a value
    const current = currentData[key]
    if (current !== undefined && current !== '' && current !== null) continue

    // Skip if previous doesn't have a value
    const prev = previousData[key]
    if (prev === undefined || prev === '' || prev === null) continue

    // Skip date fields (period_from, period_to) — these should be fresh
    if (key.includes('period_from') || key.includes('period_to')) continue

    enriched[key] = prev
    enrichedFields.push(key)
  }

  return { enriched, enrichedFields }
}

/**
 * Property-specific fields that are worth enriching from previous submissions.
 * These are building/risk details that rarely change between renewals.
 */
export const PROPERTY_ENRICHMENT_FIELDS = [
  // Building info
  'property_city', 'property_address', 'object_activity', 'building_purpose',
  'construction_type', 'roof_type', 'construction_year', 'floors', 'area_sqm',
  'sandwich_panels', 'building_standalone', 'commissioned', 'last_renovation',
  // Fire safety
  'fire_alarm', 'sprinklers', 'fire_extinguishers', 'hydrants',
  'fire_station_distance', 'fire_compliance',
  // Security
  'alarm_system', 'guard_type', 'cctv', 'occupancy',
  // Risk
  'hazardous_materials', 'water_basin_distance', 'landslide_area',
]

export const GL_ENRICHMENT_FIELDS = [
  'gl_activity', 'gl_activity_code', 'gl_website', 'gl_year_founded',
]

export const OA_ENRICHMENT_FIELDS = [
  'oa_activity', 'oa_activity_code', 'oa_secondary_activity',
]

export const PL_ENRICHMENT_FIELDS = [
  'pl_activity', 'pl_insured_profession', 'pl_professional_org',
  'pl_services_description', 'pl_territory',
]
