'use client'

import { useBrand } from '@/lib/BrandProvider'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

const SIZES = {
  sm: { container: 'h-6 w-6 rounded-md', icon: 'h-3 w-3', text: 'text-sm', img: 24 },
  md: { container: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4', text: 'text-sm', img: 32 },
  lg: { container: 'h-14 w-14 rounded-2xl', icon: 'h-7 w-7', text: 'text-2xl', img: 56 },
}

// Default document icon SVG path
const DOC_ICON = "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"

export default function BrandLogo({ size = 'md', showName = false, className = '' }: Props) {
  const { color, name, logoUrl } = useBrand()
  const s = SIZES[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          width={s.img}
          height={s.img}
          className={`${s.container} object-contain flex-shrink-0 bg-white`}
          style={{ padding: size === 'sm' ? 2 : 3 }}
          loading="lazy"
        />
      ) : (
        <div
          className={`${s.container} flex items-center justify-center flex-shrink-0 shadow-sm`}
          style={{ backgroundColor: color, boxShadow: `0 1px 3px ${color}33` }}
        >
          <svg className={`${s.icon} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={DOC_ICON} />
          </svg>
        </div>
      )}
      {showName && (
        <span className={`${s.text} font-bold text-gray-900`}>{name}</span>
      )}
    </div>
  )
}
