/**
 * formatters.ts — Shared formatting utilities used across the app.
 */

/** Relative time formatting: "Току-що", "преди 5 мин", "преди 2 ч", "преди 3 дни", "25.03.2026" */
export function fmtDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Току-що'
  if (mins < 60) return `преди ${mins} мин`
  if (hours < 24) return `преди ${hours} ч`
  if (days < 7) return `преди ${days} дни`
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Full date with time: "25.03.2026, 14:30" */
export function fmtDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString('bg-BG', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

/** Get initials from name: "Иван Петров" → "ИП" */
export function getInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

/** Normalize submission from Supabase snake_case to frontend camelCase */
export function normalizeSubmission(s: Record<string, unknown>): {
  id: string
  clientName: string
  insuranceClass: string
  selectedInsurers: string[]
  formData: Record<string, unknown>
  createdAt: string
} {
  return {
    id: String(s.id ?? ''),
    clientName: String(s.client_name ?? s.clientName ?? (s.form_data as Record<string, unknown>)?._client_name ?? 'Без клиент'),
    insuranceClass: String(s.insurance_class ?? s.insuranceClass ?? 'property'),
    selectedInsurers: (s.selected_insurers ?? s.selectedInsurers ?? []) as string[],
    formData: (s.form_data ?? s.formData ?? {}) as Record<string, unknown>,
    createdAt: String(s.created_at ?? s.createdAt ?? ''),
  }
}
