import { GL_SCHEMA, GLFormData, GLInsurerKey } from './gl-schema'

export interface GLFieldMapped {
  originalLabel: string
  value:         string | number
  displayValue:  string
}

export type GLInsurerMappedData = Record<string, GLFieldMapped>

function displayValue(value: string | number, options?: { value: string; label: string }[]): string {
  if (options) {
    const match = options.find((o) => o.value === String(value))
    if (match) return match.label
  }
  return String(value)
}

export function mapGLFormDataForInsurer(
  formData: GLFormData,
  insurerKey: GLInsurerKey,
): GLInsurerMappedData {
  const result: GLInsurerMappedData = {}

  for (const section of GL_SCHEMA) {
    for (const field of section.fields) {
      const originalLabel = field.mapping[insurerKey]
      if (!originalLabel) continue                     // field not in this insurer's form

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

export function mapGLFormDataForAll(
  formData: GLFormData,
  insurerKeys: GLInsurerKey[] = ['generali', 'bulstrad'],
): Record<GLInsurerKey, GLInsurerMappedData> {
  const result = {} as Record<GLInsurerKey, GLInsurerMappedData>
  for (const key of insurerKeys) {
    result[key] = mapGLFormDataForInsurer(formData, key)
  }
  return result
}
