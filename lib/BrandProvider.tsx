'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthProvider'

// ─── Types ───────────────────────────────────────────────────────────────────

interface BrandContextValue {
  /** Primary brand color hex (e.g. "#2563EB") */
  color: string
  /** Lighter variant for backgrounds */
  colorLight: string
  /** Brand name (company name or "InsureUnify") */
  name: string
  /** Logo URL (or null for default icon) */
  logoUrl: string | null
  /** Whether using custom branding */
  isCustom: boolean
}

const DEFAULT_COLOR = '#2563EB'
const DEFAULT_NAME = 'InsureUnify'

// ─── Color utilities ─────────────────────────────────────────────────────────

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function makeLightVariant(hex: string): string {
  const { h, s } = hexToHSL(hex)
  return `hsl(${h}, ${Math.min(s, 90)}%, 96%)`
}

// ─── Context ─────────────────────────────────────────────────────────────────

const BrandContext = createContext<BrandContextValue>({
  color: DEFAULT_COLOR,
  colorLight: makeLightVariant(DEFAULT_COLOR),
  name: DEFAULT_NAME,
  logoUrl: null,
  isCustom: false,
})

export function useBrand(): BrandContextValue {
  return useContext(BrandContext)
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function BrandProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()

  const color = (profile?.brand_color && /^#[0-9a-fA-F]{6}$/.test(profile.brand_color))
    ? profile.brand_color
    : DEFAULT_COLOR
  const colorLight = makeLightVariant(color)
  const name = profile?.company_name || DEFAULT_NAME
  const logoUrl = profile?.logo_url || null
  const isCustom = color !== DEFAULT_COLOR || !!logoUrl

  // Inject CSS custom properties on the <html> element
  useEffect(() => {
    const root = document.documentElement
    const { h, s, l } = hexToHSL(color)
    root.style.setProperty('--brand', color)
    root.style.setProperty('--brand-h', String(h))
    root.style.setProperty('--brand-s', `${s}%`)
    root.style.setProperty('--brand-l', `${l}%`)
    root.style.setProperty('--brand-light', colorLight)
    root.style.setProperty('--brand-50', `hsl(${h}, ${Math.min(s, 90)}%, 97%)`)
    root.style.setProperty('--brand-100', `hsl(${h}, ${Math.min(s, 90)}%, 93%)`)
    root.style.setProperty('--brand-600', color)
    root.style.setProperty('--brand-700', `hsl(${h}, ${s}%, ${Math.max(l - 10, 15)}%)`)
  }, [color, colorLight])

  return (
    <BrandContext.Provider value={{ color, colorLight, name, logoUrl, isCustom }}>
      {children}
    </BrandContext.Provider>
  )
}
