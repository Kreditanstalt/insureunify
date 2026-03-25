'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.target as HTMLElement)?.isContentEditable) return

      const ctrl = e.ctrlKey || e.metaKey

      // Ctrl+N → New submission
      if (ctrl && e.key === 'n') {
        e.preventDefault()
        router.push('/dashboard/new')
      }

      // Ctrl+K → Focus search (if exists on page)
      if (ctrl && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement | null
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
      }

      // Escape → Close modals, blur focused inputs
      if (e.key === 'Escape') {
        const activeEl = document.activeElement as HTMLElement
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
          activeEl.blur()
        }
        // Dispatch custom event for modal close
        document.dispatchEvent(new CustomEvent('iu:escape'))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])
}
