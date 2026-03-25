/**
 * schema-registry.ts — Unified Insurance Schema Registry
 *
 * Central registry for all insurance classes. Each class registers its schema,
 * insurers, and mapping functions. Consumers import from here instead of
 * individual schema files.
 *
 * Usage:
 *   import { getClass, getAllClasses, getInsurersForClass } from '@/lib/schema-registry'
 *   const property = getClass('property')
 *   const schema = property.schema     // SchemaSection[]
 *   const insurers = property.insurers // Record<string, InsurerMeta>
 */

// ─── Shared types ────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea'

export interface FieldOption {
  value: string
  label: string
}

export interface InsurerMeta {
  key: string
  name: string
  color: string
  formCode?: string
  description?: string
  logo: string
}

export interface SchemaField {
  id: string
  label: string
  type: FieldType
  required?: boolean
  computed?: boolean
  placeholder?: string
  options?: FieldOption[]
  mapping: Record<string, string | null | undefined>
  transforms?: Record<string, string>
  helpText?: string
}

export interface SchemaSection {
  id: string
  label: string
  shortLabel: string
  icon: string
  fields: SchemaField[]
}

export type FormData = Record<string, string | number | undefined>

export interface MappedField {
  originalLabel: string
  value: string | number
  displayValue: string
}

export type InsurerMappedData = Record<string, MappedField>

// ─── Shared option sets ──────────────────────────────────────────────────────

export const YES_NO: FieldOption[] = [
  { value: 'yes', label: 'Да' },
  { value: 'no', label: 'Не' },
]

export const CURRENCY_EUR: FieldOption[] = [
  { value: 'EUR', label: 'EUR (€)' },
]

export const PAYMENT_OPTS: FieldOption[] = [
  { value: 'once', label: 'Еднократно' },
  { value: 'installment', label: 'Разсрочено' },
]

export const TERRITORY_OPTS: FieldOption[] = [
  { value: 'bg', label: 'Република България' },
  { value: 'bg_eu', label: 'България + ЕС' },
  { value: 'bg_eu_third', label: 'България + ЕС + трети страни' },
  { value: 'worldwide', label: 'Целият свят' },
  { value: 'other', label: 'Друго' },
]

export const ACTIVITY_OPTS: FieldOption[] = [
  { value: 'retail', label: 'Търговия на дребно' },
  { value: 'wholesale', label: 'Търговия на едро' },
  { value: 'manufacturing', label: 'Производство' },
  { value: 'construction', label: 'Строителство' },
  { value: 'transport', label: 'Транспорт' },
  { value: 'services', label: 'Услуги' },
  { value: 'distribution', label: 'Дистрибуция' },
  { value: 'it', label: 'IT / Технологии' },
  { value: 'other', label: 'Друго' },
]

// ─── Insurance class definition ──────────────────────────────────────────────

export type InsuranceClassId =
  | 'property'
  | 'general_liability'
  | 'occupational_accident'
  | 'professional_liability'
  | 'trade_credit'

export interface InsuranceClassDef {
  id: InsuranceClassId
  label: string
  shortLabel: string
  icon: string
  color: string
  bg: string
  formUrl: string
  insurerKeys: string[]
  insurers: Record<string, InsurerMeta>
  schema: SchemaSection[]
  requiredFields?: string[]
  computedFields?: string[]
  defaultValues?: FormData
}

// ─── Registry ────────────────────────────────────────────────────────────────

const registry = new Map<InsuranceClassId, InsuranceClassDef>()

export function registerClass(def: InsuranceClassDef) {
  registry.set(def.id, def)
}

export function getClass(id: InsuranceClassId): InsuranceClassDef | undefined {
  return registry.get(id)
}

export function getAllClasses(): InsuranceClassDef[] {
  const result: InsuranceClassDef[] = []
  registry.forEach((v) => result.push(v))
  return result
}

export function getInsurersForClass(id: InsuranceClassId): Record<string, InsurerMeta> {
  return registry.get(id)?.insurers ?? {}
}

export function getSchemaForClass(id: InsuranceClassId): SchemaSection[] {
  return registry.get(id)?.schema ?? []
}

// ─── Class metadata (for dashboard, sidebar, etc.) ───────────────────────────

export const CLASS_META: Record<InsuranceClassId, { label: string; shortLabel: string; icon: string; color: string; bg: string; formUrl: string }> = {
  property:               { label: 'Имущество',         shortLabel: 'Имущество',    icon: '🏢', color: '#166534', bg: '#dcfce7', formUrl: '/dashboard/new/property' },
  general_liability:      { label: 'ОГО / Работодател', shortLabel: 'ОГО',          icon: '🛡️', color: '#991b1b', bg: '#fee2e2', formUrl: '/dashboard/new/general-liability' },
  occupational_accident:  { label: 'Трудова злополука', shortLabel: 'Трудова злоп.', icon: '⚡', color: '#1e3a8a', bg: '#dbeafe', formUrl: '/dashboard/new/occupational-accident' },
  professional_liability: { label: 'Проф. отговорност', shortLabel: 'Проф. отг.',   icon: '⚖️', color: '#1E2D6B', bg: '#f3e8ff', formUrl: '/dashboard/new/professional-liability' },
  trade_credit:           { label: 'Търговски кредит',  shortLabel: 'Търг. кредит', icon: '💳', color: '#92400e', bg: '#fef3c7', formUrl: '/dashboard/new/trade-credit' },
}

// ─── Unified mapping function ────────────────────────────────────────────────

export function getOptionLabel(options: FieldOption[] | undefined, value: string): string {
  if (!options) return value
  return options.find((o) => o.value === value)?.label ?? value
}

export function mapFormDataForInsurer(
  classId: InsuranceClassId,
  formData: FormData,
  insurerKey: string,
): InsurerMappedData {
  const classDef = getClass(classId)
  if (!classDef) return {}

  const result: InsurerMappedData = {}

  for (const section of classDef.schema) {
    for (const field of section.fields) {
      const originalLabel = field.mapping[insurerKey]
      if (!originalLabel) continue

      const rawValue = formData[field.id]
      if (rawValue === undefined || rawValue === '' || rawValue === null) continue

      const strValue = String(rawValue)
      const displayValue = field.options ? getOptionLabel(field.options, strValue) : strValue

      result[field.id] = {
        originalLabel,
        value: rawValue,
        displayValue,
      }
    }
  }

  return result
}

export function mapFormDataForAllInsurers(
  classId: InsuranceClassId,
  formData: FormData,
): Record<string, InsurerMappedData> {
  const classDef = getClass(classId)
  if (!classDef) return {}

  const result: Record<string, InsurerMappedData> = {}
  for (const key of classDef.insurerKeys) {
    result[key] = mapFormDataForInsurer(classId, formData, key)
  }
  return result
}

// ─── Field coverage stats ────────────────────────────────────────────────────

export function getFieldCoverage(classId: InsuranceClassId, insurerKey: string): { total: number; mapped: number; percent: number } {
  const classDef = getClass(classId)
  if (!classDef) return { total: 0, mapped: 0, percent: 0 }

  let total = 0
  let mapped = 0
  for (const section of classDef.schema) {
    for (const field of section.fields) {
      total++
      if (field.mapping[insurerKey]) mapped++
    }
  }
  return { total, mapped, percent: total > 0 ? Math.round((mapped / total) * 100) : 0 }
}

// ─── Collect all unique insurer keys across all classes ──────────────────────

export function getAllInsurers(): Record<string, InsurerMeta> {
  const all: Record<string, InsurerMeta> = {}
  registry.forEach((classDef) => {
    Object.entries(classDef.insurers).forEach(([key, meta]) => {
      if (!all[key]) all[key] = meta
    })
  })
  return all
}
