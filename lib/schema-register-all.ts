/**
 * schema-register-all.ts — Registers all insurance classes with the unified registry.
 *
 * Import this file once at app startup (e.g., in layout or a provider) to populate
 * the registry. Each class imports from its own schema file and adapts to the
 * unified InsuranceClassDef interface.
 */

import { registerClass } from './schema-registry'
import type { InsuranceClassDef, InsurerMeta, SchemaSection } from './schema-registry'

// ─── Property ────────────────────────────────────────────────────────────────
import { MASTER_SCHEMA, PROPERTY_INSURERS, PROPERTY_INSURER_KEYS, VALUE_FIELDS } from './schema'

registerClass({
  id: 'property',
  label: 'Имущество',
  shortLabel: 'Имущество',
  icon: '🏢',
  color: '#166534',
  bg: '#dcfce7',
  formUrl: '/dashboard/new/property',
  insurerKeys: PROPERTY_INSURER_KEYS as unknown as string[],
  insurers: Object.fromEntries(
    Object.entries(PROPERTY_INSURERS).map(([k, v]) => [k, { key: k, name: v.name, color: v.color, formCode: v.formCode, logo: v.logo } as InsurerMeta])
  ),
  schema: MASTER_SCHEMA as unknown as SchemaSection[],
  computedFields: ['val_total'],
  defaultValues: { currency: 'EUR', beneficiary_type: 'none' },
} satisfies InsuranceClassDef)

// ─── General Liability ───────────────────────────────────────────────────────
import { GL_SCHEMA, GL_INSURERS, GL_INSURER_KEYS } from './gl-schema'

registerClass({
  id: 'general_liability',
  label: 'ОГО / Работодател',
  shortLabel: 'ОГО',
  icon: '🛡️',
  color: '#991b1b',
  bg: '#fee2e2',
  formUrl: '/dashboard/new/general-liability',
  insurerKeys: GL_INSURER_KEYS as unknown as string[],
  insurers: Object.fromEntries(
    Object.entries(GL_INSURERS).map(([k, v]) => [k, { key: k, name: v.name, color: v.color, formCode: v.formCode, description: v.description, logo: v.logo } as InsurerMeta])
  ),
  schema: GL_SCHEMA as unknown as SchemaSection[],
})

// ─── Occupational Accident ───────────────────────────────────────────────────
import { OA_SCHEMA, OA_INSURERS, OA_INSURER_KEYS } from './oa-schema'

registerClass({
  id: 'occupational_accident',
  label: 'Трудова злополука',
  shortLabel: 'Трудова злоп.',
  icon: '⚡',
  color: '#1e3a8a',
  bg: '#dbeafe',
  formUrl: '/dashboard/new/occupational-accident',
  insurerKeys: OA_INSURER_KEYS as unknown as string[],
  insurers: Object.fromEntries(
    Object.entries(OA_INSURERS).map(([k, v]) => [k, { key: k, name: v.name, color: v.color, formCode: v.formCode, description: v.description, logo: v.logo } as InsurerMeta])
  ),
  schema: OA_SCHEMA as unknown as SchemaSection[],
})

// ─── Professional Liability ──────────────────────────────────────────────────
import { PL_SCHEMA, PL_INSURERS, PL_INSURER_KEYS } from './pl-schema'

registerClass({
  id: 'professional_liability',
  label: 'Проф. отговорност',
  shortLabel: 'Проф. отг.',
  icon: '⚖️',
  color: '#1E2D6B',
  bg: '#f3e8ff',
  formUrl: '/dashboard/new/professional-liability',
  insurerKeys: PL_INSURER_KEYS as unknown as string[],
  insurers: Object.fromEntries(
    Object.entries(PL_INSURERS).map(([k, v]) => [k, { key: k, name: v.name, color: v.color, formCode: v.formCode, description: v.description, logo: v.logo } as InsurerMeta])
  ),
  schema: PL_SCHEMA as unknown as SchemaSection[],
})

// ─── Trade Credit ────────────────────────────────────────────────────────────
import { TC_INSURERS } from './tc-schema'

registerClass({
  id: 'trade_credit',
  label: 'Търговски кредит',
  shortLabel: 'Търг. кредит',
  icon: '💳',
  color: '#92400e',
  bg: '#fef3c7',
  formUrl: '/dashboard/new/trade-credit',
  insurerKeys: Object.keys(TC_INSURERS),
  insurers: Object.fromEntries(
    Object.entries(TC_INSURERS).map(([k, v]) => [k, { key: k, name: v.name, color: v.color, logo: v.logo } as InsurerMeta])
  ),
  schema: [], // TC uses flat interface, not schema sections
})

// Re-export for convenience
export { VALUE_FIELDS }
