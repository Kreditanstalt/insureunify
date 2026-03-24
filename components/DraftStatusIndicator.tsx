'use client'

interface Props {
  status: string | null
}

export default function DraftStatusIndicator({ status }: Props) {
  if (!status) return null

  const isSaving = status === 'Запазване...'
  const isSaved = status === 'Запазено ✓'

  return (
    <p className={[
      'text-xs mt-1 transition-colors',
      isSaving ? 'text-gray-400'
        : isSaved ? 'text-emerald-500'
        : 'text-gray-400',
    ].join(' ')}>
      {isSaving && (
        <svg className="inline w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {status}
    </p>
  )
}
