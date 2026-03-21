import { MASTER_SCHEMA, INSURERS, FormData, InsurerKey, TransformType } from './schema'

// ─── Transform functions ───────────────────────────────────────────────────────

function yearToRange(yearStr: string): string {
  const year = parseInt(yearStr, 10)
  if (isNaN(year)) return yearStr
  const age = new Date().getFullYear() - year
  if (age <= 4) return 'до 4 год.'
  if (age <= 10) return '5-10 год.'
  if (age <= 20) return '11-20 год.'
  return 'над 20 год.'
}

function floorsToRange(floorsStr: string): string {
  const n = parseInt(floorsStr, 10)
  if (isNaN(n)) return floorsStr
  if (n <= 2) return '1-2'
  if (n <= 5) return '3-5'
  if (n <= 10) return '6-10'
  return 'над 10'
}

function distanceToBoolean(distanceValue: string): string {
  // For fire_station_distance: lt_1, 1_3 → Да (<2км); 3_5, 5_10, gt_10 → Не
  // For water_basin_distance: lt_500 → Да (≤50m proxy); others → Не
  const nearValues = ['lt_1', '1_3', 'lt_500']
  return nearValues.includes(distanceValue) ? 'Да' : 'Не'
}

function monthsToYears(value: string): string {
  // Instinct asks for 36 months history — we collect yes/no, same semantics
  return value === 'yes' ? 'Да (36 мес.)' : 'Не'
}

function applyTransform(value: string, transform: TransformType): string {
  switch (transform) {
    case 'year_to_range': return yearToRange(value)
    case 'floors_to_range': return floorsToRange(value)
    case 'distance_to_boolean': return distanceToBoolean(value)
    case 'months_to_years': return monthsToYears(value)
    default: return value
  }
}

// ─── Label helpers ─────────────────────────────────────────────────────────────

function getOptionLabel(fieldId: string, value: string): string {
  for (const section of MASTER_SCHEMA) {
    const field = section.fields.find((f) => f.id === fieldId)
    if (field?.options) {
      const opt = field.options.find((o) => o.value === value)
      if (opt) return opt.label
    }
  }
  return value
}

// ─── Main mapping function ────────────────────────────────────────────────────

export interface MappedField {
  originalLabel: string
  value: string
  displayValue: string
}

export type InsurerMappedData = Record<string, MappedField>

export function mapFormDataForInsurer(
  formData: FormData,
  insurerKey: InsurerKey
): InsurerMappedData {
  const result: InsurerMappedData = {}

  for (const section of MASTER_SCHEMA) {
    for (const field of section.fields) {
      const originalLabel = field.mapping[insurerKey]
      if (!originalLabel) continue // field not used by this insurer

      const rawValue = formData[field.id]
      if (rawValue === undefined || rawValue === '') continue

      const strValue = String(rawValue)

      // Apply transform if present
      const transform = field.transforms?.[insurerKey]
      const transformedValue = transform ? applyTransform(strValue, transform) : strValue

      // Human-readable label for display
      const displayValue = field.type === 'select'
        ? getOptionLabel(field.id, strValue)
        : strValue

      result[field.id] = {
        originalLabel,
        value: transformedValue,
        displayValue,
      }
    }
  }

  return result
}

export function mapFormDataForAllInsurers(
  formData: FormData,
  selectedInsurers: InsurerKey[]
): Record<InsurerKey, InsurerMappedData> {
  const result = {} as Record<InsurerKey, InsurerMappedData>
  for (const key of selectedInsurers) {
    result[key] = mapFormDataForInsurer(formData, key)
  }
  return result
}

// ─── Coverage stats ────────────────────────────────────────────────────────────

export function getFieldCoverage(insurerKey: InsurerKey): number {
  let total = 0
  let mapped = 0
  for (const section of MASTER_SCHEMA) {
    for (const field of section.fields) {
      total++
      if (field.mapping[insurerKey]) mapped++
    }
  }
  return Math.round((mapped / total) * 100)
}

export { INSURERS }
