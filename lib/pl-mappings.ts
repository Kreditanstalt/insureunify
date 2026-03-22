import { PL_SCHEMA, PLFormData, PLInsurerKey } from './pl-schema'
import type { SchemaSection } from './schema'

export interface PLMappedField {
  originalLabel: string
  value: string
  displayValue: string
}

export type PLInsurerMappedData = Record<string, PLMappedField>

function getOptionLabel(schema: SchemaSection[], fieldId: string, value: string): string {
  for (const section of schema) {
    const field = section.fields.find((f) => f.id === fieldId)
    if (field?.options) {
      const opt = field.options.find((o) => o.value === value)
      if (opt) return opt.label
    }
  }
  return value
}

export function mapPLFormDataForInsurer(
  formData: PLFormData,
  insurerKey: PLInsurerKey
): PLInsurerMappedData {
  const result: PLInsurerMappedData = {}

  for (const section of PL_SCHEMA) {
    for (const field of section.fields) {
      const originalLabel = field.mapping[insurerKey]
      if (!originalLabel) continue

      const rawValue = formData[field.id]
      if (rawValue === undefined || rawValue === '') continue

      const strValue = String(rawValue)
      const displayValue =
        field.type === 'select'
          ? getOptionLabel(PL_SCHEMA as SchemaSection[], field.id, strValue)
          : strValue

      result[field.id] = {
        originalLabel,
        value: strValue,
        displayValue,
      }
    }
  }

  return result
}

export function mapPLFormDataForAllInsurers(
  formData: PLFormData,
  selectedInsurers: PLInsurerKey[]
): Record<PLInsurerKey, PLInsurerMappedData> {
  const result = {} as Record<PLInsurerKey, PLInsurerMappedData>
  for (const key of selectedInsurers) {
    result[key] = mapPLFormDataForInsurer(formData, key)
  }
  return result
}
