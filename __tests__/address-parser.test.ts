import { describe, it, expect } from 'vitest'
import { parseAddress } from '@/lib/addressParser'

describe('parseAddress', () => {
  it('parses "гр. Град, улица"', () => {
    const result = parseAddress('гр. София, ул. Алабин 1, ет. 3')
    expect(result.city).toBe('София')
    expect(result.street).toBe('ул. Алабин 1, ет. 3')
  })

  it('parses "гр Град, улица" without dot', () => {
    const result = parseAddress('гр Пловдив, бул. Руски 15')
    expect(result.city).toBe('Пловдив')
    expect(result.street).toBe('бул. Руски 15')
  })

  it('parses "с. Град, ..."', () => {
    const result = parseAddress('с. Бистрица, общ. Столична')
    expect(result.city).toBe('Бистрица')
    expect(result.street).toBe('общ. Столична')
  })

  it('parses postal code format "1000 София, ..."', () => {
    const result = parseAddress('1000 София, бул. Витоша 15')
    expect(result.city).toBe('София')
    expect(result.street).toBe('бул. Витоша 15')
  })

  it('parses "Град, ул. ..."', () => {
    const result = parseAddress('Варна, ул. Цар Борис I 25')
    expect(result.city).toBe('Варна')
    expect(result.street).toBe('ул. Цар Борис I 25')
  })

  it('parses simple "Град, адрес"', () => {
    const result = parseAddress('Бургас, к-с Славейков, бл. 55')
    expect(result.city).toBe('Бургас')
    expect(result.street).toBe('к-с Славейков, бл. 55')
  })

  it('returns empty city for address-only input', () => {
    const result = parseAddress('ул. Витоша 100')
    expect(result.city).toBe('')
    expect(result.street).toBe('ул. Витоша 100')
  })

  it('handles empty input', () => {
    expect(parseAddress('').city).toBe('')
    expect(parseAddress('').street).toBe('')
  })

  it('handles null-ish input', () => {
    expect(parseAddress(undefined as unknown as string).city).toBe('')
  })
})
