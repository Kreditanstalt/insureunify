'use client'

// Pulse animation base
const pulse = 'animate-pulse bg-gray-200 rounded'

// ─── Basic building blocks ──────────────────────────────────────────────────

export function SkeletonLine({ width = 'w-full', height = 'h-3' }: { width?: string; height?: string }) {
  return <div className={`${pulse} ${width} ${height}`} />
}

export function SkeletonCircle({ size = 'h-8 w-8' }: { size?: string }) {
  return <div className={`${pulse} rounded-full ${size}`} />
}

export function SkeletonCard({ height = 'h-24' }: { height?: string }) {
  return <div className={`${pulse} rounded-xl ${height} w-full`} />
}

// ─── Dashboard skeleton ─────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="min-h-full bg-[#F8F9FA]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5">
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0 space-y-5">
            {/* Hero bar */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonLine width="w-48" height="h-5" />
                <SkeletonLine width="w-32" height="h-3" />
              </div>
              <SkeletonLine width="w-36" height="h-9" />
            </div>
            {/* Quick cards */}
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => <SkeletonCard key={i} height="h-14" />)}
            </div>
            {/* Submissions list */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 border-b border-gray-50">
                  <SkeletonCircle />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonLine width="w-40" height="h-3.5" />
                    <SkeletonLine width="w-24" height="h-2.5" />
                  </div>
                  <SkeletonLine width="w-16" height="h-3" />
                </div>
              ))}
            </div>
          </div>
          {/* Right sidebar */}
          <div className="hidden lg:block w-[280px] flex-shrink-0 space-y-4">
            <SkeletonCard height="h-28" />
            <SkeletonCard height="h-32" />
            <SkeletonCard height="h-40" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Submissions page skeleton ──────────────────────────────────────────────

export function SubmissionsSkeleton() {
  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLine width="w-40" height="h-6" />
        <SkeletonLine width="w-32" height="h-9" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3 border-b border-gray-50">
            <SkeletonCircle />
            <div className="flex-1 space-y-1.5">
              <SkeletonLine width="w-48" height="h-3.5" />
              <SkeletonLine width="w-28" height="h-2.5" />
            </div>
            <SkeletonLine width="w-20" height="h-3" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Form skeleton ──────────────────────────────────────────────────────────

export function FormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <SkeletonLine width="w-52" height="h-7" />
      <SkeletonLine width="w-72" height="h-3" />
      <SkeletonCard height="h-12" />
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <SkeletonLine width="w-28" height="h-3" />
            <SkeletonLine height="h-10" />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <SkeletonLine width="w-24" height="h-10" />
        <SkeletonLine width="w-24" height="h-10" />
      </div>
    </div>
  )
}
