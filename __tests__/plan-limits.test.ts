import { describe, it, expect } from 'vitest'
import { PLAN_LABELS, currentMonth } from '@/lib/planLimits'

describe('Plan Labels', () => {
  it('has trial, basic, pro', () => {
    expect(PLAN_LABELS.trial).toBeDefined()
    expect(PLAN_LABELS.basic).toBeDefined()
    expect(PLAN_LABELS.pro).toBeDefined()
  })

  it('each plan has label, color, bg', () => {
    for (const plan of Object.values(PLAN_LABELS)) {
      expect(plan.label).toBeTruthy()
      expect(plan.color).toMatch(/^#/)
      expect(plan.bg).toMatch(/^#/)
    }
  })
})

describe('currentMonth', () => {
  it('returns YYYY-MM format', () => {
    const month = currentMonth()
    expect(month).toMatch(/^\d{4}-\d{2}$/)
  })

  it('matches current date', () => {
    const now = new Date()
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    expect(currentMonth()).toBe(expected)
  })
})
