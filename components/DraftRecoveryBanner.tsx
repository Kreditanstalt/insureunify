'use client'

import type { Draft } from '@/lib/drafts'

interface Props {
  draft: Draft
  onRestore: () => void
  onDismiss: () => void
}

export default function DraftRecoveryBanner({ draft, onRestore, onDismiss }: Props) {
  const date = new Date(draft.savedAt)
  const formatted = date.toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-4">
      <div className="flex items-start gap-3">
        <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900">
            Намерена незавършена чернова от {formatted}
            {draft.clientName && (
              <span className="text-amber-700"> — {draft.clientName}</span>
            )}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Искате ли да продължите оттам?
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={onRestore}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700 min-h-[36px]"
            >
              Продължи черновата
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-50 min-h-[36px]"
            >
              Започни наново
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
