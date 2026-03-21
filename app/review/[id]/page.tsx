'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { InsurerKey, FormData } from '@/lib/schema'
import { mapFormDataForAllInsurers, InsurerMappedData } from '@/lib/mappings'
import ReviewOutput from '@/components/ReviewOutput'

interface StoredSubmission {
  id: string
  clientName: string
  selectedInsurers: InsurerKey[]
  formData: FormData
  createdAt: string
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [submission, setSubmission] = useState<StoredSubmission | null>(null)
  const [mappedData, setMappedData] = useState<Record<InsurerKey, InsurerMappedData> | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('iu_submissions')
    if (!raw) { setNotFound(true); return }

    const list: StoredSubmission[] = JSON.parse(raw)
    const found = list.find((s) => s.id === id)
    if (!found) { setNotFound(true); return }

    setSubmission(found)
    setMappedData(mapFormDataForAllInsurers(found.formData, found.selectedInsurers))
  }, [id])

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Въпросникът не е намерен.</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          Към dashboard
        </Link>
      </div>
    )
  }

  if (!submission || !mappedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-none">
                {submission.clientName}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(submission.createdAt).toLocaleDateString('bg-BG', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-gray-400">
              {submission.selectedInsurers.length} застрахователя
            </span>
            <Link
              href="/dashboard/new"
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors font-medium"
            >
              + Нов
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <ReviewOutput
          mappedData={mappedData}
          selectedInsurers={submission.selectedInsurers}
          clientName={submission.clientName}
          formData={submission.formData}
        />
      </main>
    </div>
  )
}
