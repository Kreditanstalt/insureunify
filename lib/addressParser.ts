/**
 * Parse a Bulgarian address string into city and street parts.
 * Examples:
 *   "гр. София, ул. Алабин 1, ет. 3" → { city: "София", street: "ул. Алабин 1, ет. 3" }
 *   "с. Бистрица, общ. Столична" → { city: "Бистрица", street: "общ. Столична" }
 *   "1000 София, бул. Витоша 15" → { city: "София", street: "бул. Витоша 15" }
 */
export function parseAddress(address: string): { city: string; street: string } {
  if (!address || !address.trim()) return { city: '', street: '' }

  const s = address.trim()

  // Pattern 1: "гр. Град, ..." or "с. Град, ..."
  const grMatch = s.match(/^(?:гр\.?|с\.?|град)\s*([^,]+),?\s*(.*)/i)
  if (grMatch) {
    return { city: grMatch[1].trim(), street: grMatch[2].trim() }
  }

  // Pattern 2: "Град, ул. / бул. ..."
  const commaMatch = s.match(/^([^,]+),\s*((?:ул|бул|пл|ж\.?к|кв|п\.?к)\.?.*)$/i)
  if (commaMatch) {
    return { city: commaMatch[1].trim(), street: commaMatch[2].trim() }
  }

  // Pattern 3: "1234 Град, ..."  (postal code + city)
  const postalMatch = s.match(/^(\d{4})\s+([^,]+),?\s*(.*)/i)
  if (postalMatch) {
    return { city: postalMatch[2].trim(), street: postalMatch[3].trim() }
  }

  // Pattern 4: Just "Град, rest"
  const simpleComma = s.split(',')
  if (simpleComma.length >= 2) {
    const firstPart = simpleComma[0].trim()
    // If first part looks like a city name (no street keywords)
    if (!/ул\.|бул\.|пл\.|ж\.?к|кв\.|п\.?к|ет\.|вх\./i.test(firstPart)) {
      return { city: firstPart, street: simpleComma.slice(1).join(',').trim() }
    }
  }

  // Fallback: put everything in street
  return { city: '', street: s }
}
