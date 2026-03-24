'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getClient, storePrefill, type ClientProfile } from '@/lib/clients'

const CLASSES = [
  { id: 'property',               icon: '🏢', label: 'Имущество',          href: '/dashboard/new/property' },
  { id: 'professional_liability', icon: '⚖️', label: 'Проф. отговорност',  href: '/dashboard/new/professional-liability' },
  { id: 'general_liability',      icon: '🔧', label: 'ОГО',                href: '/dashboard/new/general-liability' },
  { id: 'occupational_accident',  icon: '⚡', label: 'Трудова злополука',  href: '/dashboard/new/occupational-accident' },
  { id: 'trade_credit',           icon: '💳', label: 'Търговски кредит',   href: '/dashboard/new/trade-credit' },
]

interface Props {
  clientId: string
  /** Render prop for the trigger button */
  children: (props: { onClick: () => void; ref: React.Ref<HTMLButtonElement> }) => React.ReactNode
}

export default function QuickStartMenu({ clientId, children }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleSelect(href: string) {
    const client = getClient(clientId)
    if (client) {
      storePrefill(buildPrefill(client))
    }
    setOpen(false)
    router.push(href)
  }

  return (
    <div className="relative">
      {children({ onClick: () => setOpen((p) => !p), ref: triggerRef })}
      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Вид застраховка</p>
          </div>
          {CLASSES.map((cls) => (
            <button
              key={cls.id}
              type="button"
              onClick={() => handleSelect(cls.href)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span className="text-base">{cls.icon}</span>
              <span className="font-medium">{cls.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function buildPrefill(client: ClientProfile) {
  return {
    clientId:         client.id,
    company_name:     client.company_name,
    eik:              client.eik,
    address:          client.address,
    city:             client.city,
    phone:            client.phone,
    email:            client.email,
    activity:         client.activity,
    nkid_code:        client.nkid_code,
    representative:   client.representative,
    employees_count:  client.employees_count,
    annual_wage_fund: client.annual_wage_fund,
    annual_revenue:   client.annual_revenue,
    property_address:   client.property_address,
    construction_type:  client.construction_type,
    roof_type:          client.roof_type,
    construction_year:  client.construction_year,
    floors:             client.floors,
    area_sqm:           client.area_sqm,
    fire_alarm:         client.fire_alarm,
    sprinklers:         client.sprinklers,
    security_system:    client.security_system,
  }
}
