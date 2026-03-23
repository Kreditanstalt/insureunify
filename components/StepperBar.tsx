'use client'

import { useEffect, useState, useRef } from 'react'

interface Step {
  id: string
  label: string
  icon?: string
}

interface Props {
  steps: Step[]
  activeId: string
  completedIds: string[]
  onNavigate: (id: string) => void
}

export default function StepperBar({ steps, activeId, completedIds, onNavigate }: Props) {
  const activeIdx = steps.findIndex((s) => s.id === activeId)
  const ref = useRef<HTMLDivElement>(null)

  // Scroll active step into view
  useEffect(() => {
    const el = ref.current?.querySelector('[data-active="true"]') as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeId])

  return (
    <div
      ref={ref}
      className="flex items-center gap-0 overflow-x-auto scrollbar-hide py-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {steps.map((step, idx) => {
        const isActive    = step.id === activeId
        const isCompleted = completedIds.includes(step.id)
        const isReachable = idx <= activeIdx || isCompleted
        const isLast      = idx === steps.length - 1

        return (
          <div key={step.id} className="flex items-center flex-shrink-0">
            {/* Step button */}
            <button
              type="button"
              data-active={isActive}
              onClick={() => isReachable && onNavigate(step.id)}
              disabled={!isReachable}
              className={[
                'flex flex-col items-center gap-1 px-1 transition-all',
                isReachable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
              ].join(' ')}
            >
              {/* Circle */}
              <div className={[
                'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all text-sm font-bold',
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200'
                  : isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-gray-200 bg-white text-gray-400',
              ].join(' ')}>
                {isCompleted && !isActive ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.icon ? (
                  <span className="text-base leading-none">{step.icon}</span>
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>
              {/* Label */}
              <span className={[
                'text-[10px] font-medium whitespace-nowrap max-w-[72px] text-center leading-tight',
                isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400',
              ].join(' ')}>
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {!isLast && (
              <div className={[
                'h-0.5 w-8 sm:w-12 mx-1 rounded-full flex-shrink-0 transition-colors',
                idx < activeIdx || (isCompleted && completedIds.includes(steps[idx + 1]?.id))
                  ? 'bg-emerald-400'
                  : idx === activeIdx - 1
                    ? 'bg-blue-300'
                    : 'bg-gray-200',
              ].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
