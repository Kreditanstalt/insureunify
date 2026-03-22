import { OA_SCHEMA, OAFormData, OAInsurerKey } from './oa-schema'

export interface OAFieldMapped {
  originalLabel: string
  value:         string | number
  displayValue:  string
}

export type OAInsurerMappedData = Record<string, OAFieldMapped>

function displayValue(value: string | number, options?: { value: string; label: string }[]): string {
  if (options) {
    const match = options.find((o) => o.value === String(value))
    if (match) return match.label
  }
  return String(value)
}

export function mapOAFormDataForInsurer(
  formData: OAFormData,
  insurerKey: OAInsurerKey,
): OAInsurerMappedData {
  const result: OAInsurerMappedData = {}

  for (const section of OA_SCHEMA) {
    for (const field of section.fields) {
      const originalLabel = field.mapping[insurerKey]
      if (!originalLabel) continue

      const raw = formData[field.id]
      if (raw === undefined || raw === null || raw === '') continue

      result[field.id] = {
        originalLabel,
        value:        raw,
        displayValue: displayValue(raw, field.options),
      }
    }
  }

  return result
}

export function mapOAFormDataForAll(
  formData: OAFormData,
  insurerKeys: OAInsurerKey[] = ['allianz', 'groupama'],
): Record<OAInsurerKey, OAInsurerMappedData> {
  const result = {} as Record<OAInsurerKey, OAInsurerMappedData>
  for (const key of insurerKeys) {
    result[key] = mapOAFormDataForInsurer(formData, key)
  }
  return result
}
