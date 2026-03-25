import { describe, it, expect, beforeAll } from 'vitest'
import {
  getClass,
  getAllClasses,
  getInsurersForClass,
  getSchemaForClass,
  mapFormDataForInsurer,
  mapFormDataForAllInsurers,
  getFieldCoverage,
  getAllInsurers,
  YES_NO,
  CURRENCY_EUR,
  ACTIVITY_OPTS,
  CLASS_META,
} from '@/lib/schema-registry'

// Register all classes before tests
beforeAll(async () => {
  await import('@/lib/schema-register-all')
})

// ─── Registry ────────────────────────────────────────────────────────────────

describe('Schema Registry', () => {
  it('registers all 5 insurance classes', () => {
    const classes = getAllClasses()
    expect(classes.length).toBe(5)
  })

  it('can retrieve each class by ID', () => {
    const ids = ['property', 'general_liability', 'occupational_accident', 'professional_liability', 'trade_credit'] as const
    for (const id of ids) {
      const cls = getClass(id)
      expect(cls).toBeDefined()
      expect(cls!.id).toBe(id)
      expect(cls!.label).toBeTruthy()
      expect(cls!.icon).toBeTruthy()
    }
  })

  it('returns undefined for unknown class', () => {
    // @ts-expect-error testing invalid input
    expect(getClass('unknown')).toBeUndefined()
  })
})

// ─── Insurers ────────────────────────────────────────────────────────────────

describe('Insurers', () => {
  it('property has 4 insurers', () => {
    const insurers = getInsurersForClass('property')
    expect(Object.keys(insurers).length).toBe(4)
    expect(insurers.bulstrad).toBeDefined()
    expect(insurers.generali).toBeDefined()
    expect(insurers.instinct).toBeDefined()
    expect(insurers.ozk).toBeDefined()
  })

  it('GL has 3 insurers', () => {
    const insurers = getInsurersForClass('general_liability')
    expect(Object.keys(insurers).length).toBe(3)
    expect(insurers.generali).toBeDefined()
    expect(insurers.bulstrad).toBeDefined()
    expect(insurers.ozk).toBeDefined()
  })

  it('OA has 3 insurers', () => {
    const insurers = getInsurersForClass('occupational_accident')
    expect(Object.keys(insurers).length).toBe(3)
    expect(insurers.allianz).toBeDefined()
    expect(insurers.groupama).toBeDefined()
  })

  it('PL has 4 insurers', () => {
    const insurers = getInsurersForClass('professional_liability')
    expect(Object.keys(insurers).length).toBe(4)
    expect(insurers.axiom).toBeDefined()
    expect(insurers.bulstrad).toBeDefined()
    expect(insurers.euroins).toBeDefined()
  })

  it('TC has 2 insurers', () => {
    const insurers = getInsurersForClass('trade_credit')
    expect(Object.keys(insurers).length).toBe(2)
  })

  it('all insurers have required fields', () => {
    const all = getAllInsurers()
    for (const [key, meta] of Object.entries(all)) {
      expect(meta.name, `${key} missing name`).toBeTruthy()
      expect(meta.color, `${key} missing color`).toMatch(/^#/)
      expect(meta.logo, `${key} missing logo`).toBeTruthy()
    }
  })

  it('getAllInsurers returns unique set from all classes', () => {
    const all = getAllInsurers()
    // At minimum: bulstrad, generali, instinct, ozk, allianz, groupama, axiom, euroins, atradius, allianz_trade
    expect(Object.keys(all).length).toBeGreaterThanOrEqual(10)
  })
})

// ─── Schema structure ────────────────────────────────────────────────────────

describe('Schema Structure', () => {
  it('property schema has 9 sections', () => {
    const schema = getSchemaForClass('property')
    expect(schema.length).toBe(9)
  })

  it('GL schema has 5+ sections', () => {
    const schema = getSchemaForClass('general_liability')
    expect(schema.length).toBeGreaterThanOrEqual(5)
  })

  it('every section has required fields', () => {
    for (const cls of getAllClasses()) {
      for (const section of cls.schema) {
        expect(section.id, `section missing id in ${cls.id}`).toBeTruthy()
        expect(section.label, `section missing label in ${cls.id}`).toBeTruthy()
        expect(section.icon, `section missing icon in ${cls.id}`).toBeTruthy()
        expect(Array.isArray(section.fields)).toBe(true)
      }
    }
  })

  it('every field has id, label, type, and mapping', () => {
    for (const cls of getAllClasses()) {
      for (const section of cls.schema) {
        for (const field of section.fields) {
          expect(field.id, `field missing id in ${section.id}`).toBeTruthy()
          expect(field.label, `field ${field.id} missing label`).toBeTruthy()
          expect(field.type, `field ${field.id} missing type`).toBeTruthy()
          expect(field.mapping, `field ${field.id} missing mapping`).toBeDefined()
          expect(typeof field.mapping).toBe('object')
        }
      }
    }
  })

  it('select fields have options', () => {
    for (const cls of getAllClasses()) {
      for (const section of cls.schema) {
        for (const field of section.fields) {
          if (field.type === 'select') {
            expect(field.options, `select field ${field.id} missing options`).toBeDefined()
            expect(field.options!.length, `select field ${field.id} has 0 options`).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  it('no duplicate field IDs within a class', () => {
    for (const cls of getAllClasses()) {
      const ids = cls.schema.flatMap((s) => s.fields.map((f) => f.id))
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size, `duplicate field IDs in ${cls.id}: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`).toBe(ids.length)
    }
  })
})

// ─── Field mappings ──────────────────────────────────────────────────────────

describe('Field Mappings', () => {
  it('property Bulstrad maps company_name', () => {
    const mapped = mapFormDataForInsurer('property', { company_name: 'Тест ЕООД' }, 'bulstrad')
    expect(mapped.company_name).toBeDefined()
    expect(mapped.company_name.displayValue).toBe('Тест ЕООД')
    expect(mapped.company_name.originalLabel).toBeTruthy()
  })

  it('property OZK maps company_name', () => {
    const mapped = mapFormDataForInsurer('property', { company_name: 'Тест ОЗК' }, 'ozk')
    expect(mapped.company_name).toBeDefined()
    expect(mapped.company_name.displayValue).toBe('Тест ОЗК')
  })

  it('skips unmapped fields', () => {
    const mapped = mapFormDataForInsurer('property', { company_name: 'Test', nkid_code: '47.11' }, 'instinct')
    expect(mapped.company_name).toBeDefined()
    // nkid_code has instinct: null → should not be mapped
    expect(mapped.nkid_code).toBeUndefined()
  })

  it('skips empty values', () => {
    const mapped = mapFormDataForInsurer('property', { company_name: '', eik: '123456789' }, 'bulstrad')
    expect(mapped.company_name).toBeUndefined()
    expect(mapped.eik).toBeDefined()
  })

  it('resolves select option labels', () => {
    const mapped = mapFormDataForInsurer('property', { construction_type: 'reinforced_concrete' }, 'bulstrad')
    expect(mapped.construction_type).toBeDefined()
    expect(mapped.construction_type.displayValue).toBe('Стоманобетонна')
  })

  it('mapFormDataForAllInsurers returns data for all insurers', () => {
    const all = mapFormDataForAllInsurers('property', { company_name: 'Тест' })
    expect(Object.keys(all).length).toBe(4) // bulstrad, generali, instinct, ozk
    expect(all.bulstrad.company_name).toBeDefined()
  })
})

// ─── Field coverage ──────────────────────────────────────────────────────────

describe('Field Coverage', () => {
  it('Bulstrad has high property field coverage', () => {
    const cov = getFieldCoverage('property', 'bulstrad')
    expect(cov.total).toBeGreaterThan(50)
    expect(cov.mapped).toBeGreaterThan(30)
    expect(cov.percent).toBeGreaterThan(50)
  })

  it('OZK has property field coverage > 0', () => {
    const cov = getFieldCoverage('property', 'ozk')
    expect(cov.mapped).toBeGreaterThan(0)
  })

  it('unknown insurer has 0 coverage', () => {
    const cov = getFieldCoverage('property', 'nonexistent')
    expect(cov.mapped).toBe(0)
  })
})

// ─── Shared options ──────────────────────────────────────────────────────────

describe('Shared Options', () => {
  it('YES_NO has 2 options', () => {
    expect(YES_NO.length).toBe(2)
    expect(YES_NO[0].value).toBe('yes')
    expect(YES_NO[1].value).toBe('no')
  })

  it('CURRENCY_EUR has EUR', () => {
    expect(CURRENCY_EUR[0].value).toBe('EUR')
  })

  it('ACTIVITY_OPTS has 9 options', () => {
    expect(ACTIVITY_OPTS.length).toBe(9)
  })

  it('CLASS_META has all 5 classes', () => {
    expect(Object.keys(CLASS_META).length).toBe(5)
    for (const meta of Object.values(CLASS_META)) {
      expect(meta.label).toBeTruthy()
      expect(meta.formUrl).toMatch(/^\/dashboard\/new\//)
    }
  })
})
