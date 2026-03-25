'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/ToastProvider'
import { ROLE_LABELS, type UserRole } from '@/lib/roles'

interface Member {
  id: string
  user_id: string | null
  email: string
  role: UserRole
  created_at: string
}

export default function TeamPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('broker')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetch('/api/team').then((r) => r.json()).then((d) => setMembers(d.members ?? [])).finally(() => setLoading(false))
  }, [])

  async function invite() {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      const data = await res.json()
      if (data.ok) {
        setMembers((prev) => [...prev, data.member])
        setInviteEmail('')
        toast.success(`Поканен: ${inviteEmail}`)
      } else {
        toast.error(data.error ?? 'Грешка при покана')
      }
    } catch {
      toast.error('Грешка при покана')
    }
    setInviting(false)
  }

  async function changeRole(memberId: string, role: UserRole) {
    const res = await fetch('/api/team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, role }),
    })
    if ((await res.json()).ok) {
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role } : m))
      toast.success('Ролята е обновена')
    }
  }

  async function removeMember(memberId: string, email: string) {
    if (!confirm(`Премахване на ${email} от екипа?`)) return
    const res = await fetch('/api/team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, action: 'remove' }),
    })
    if ((await res.json()).ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
      toast.success('Потребителят е премахнат')
    }
  }

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Екип</h1>
          <p className="text-sm text-gray-500 mt-1">Управление на потребители и роли</p>
        </div>

        {/* Invite */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Покани нов потребител</h2>
          </div>
          <div className="p-5">
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="kolega@firma.bg"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && invite()}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="broker">Брокер</option>
                <option value="viewer">Наблюдател</option>
              </select>
              <button
                onClick={invite}
                disabled={inviting || !inviteEmail.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {inviting ? '...' : 'Покани'}
              </button>
            </div>
            <div className="mt-3 flex gap-4">
              {(['broker_admin', 'broker', 'viewer'] as UserRole[]).map((r) => {
                const info = ROLE_LABELS[r]
                return (
                  <div key={r} className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: info.color }} />
                    <span className="text-[11px] text-gray-500"><span className="font-medium" style={{ color: info.color }}>{info.label}</span> — {info.description}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Members list */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Членове на екипа</h2>
            <span className="text-xs text-gray-400">{members.length} потребител{members.length !== 1 ? 'и' : ''}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Зареждане...</div>
            ) : members.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Все още няма членове на екипа</div>
            ) : (
              members.map((m) => {
                const isMe = m.user_id === user?.id
                const info = ROLE_LABELS[m.role] ?? ROLE_LABELS.broker
                return (
                  <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: info.bg, color: info.color }}>
                      {m.email[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {m.email}
                        {isMe && <span className="ml-1.5 text-[10px] text-gray-400">(вие)</span>}
                      </p>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: info.bg, color: info.color }}>
                        {info.label}
                      </span>
                    </div>
                    {!isMe && (
                      <div className="flex items-center gap-2">
                        <select
                          value={m.role}
                          onChange={(e) => changeRole(m.id, e.target.value as UserRole)}
                          className="rounded border border-gray-200 px-2 py-1 text-xs bg-white"
                        >
                          <option value="broker_admin">Администратор</option>
                          <option value="broker">Брокер</option>
                          <option value="viewer">Наблюдател</option>
                        </select>
                        <button
                          onClick={() => removeMember(m.id, m.email)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="Премахни"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
