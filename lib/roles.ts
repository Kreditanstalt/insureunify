/**
 * roles.ts — Role-based access control for multi-user broker accounts.
 *
 * Roles:
 *   broker_admin  — Full access: manage users, billing, settings, all data
 *   broker        — Standard access: create/edit submissions, clients, comparisons
 *   viewer        — Read-only: view submissions, clients, comparisons, download PDFs
 *
 * Usage:
 *   import { hasPermission, PERMISSIONS } from '@/lib/roles'
 *   if (hasPermission(userRole, 'submissions.create')) { ... }
 */

export type UserRole = 'broker_admin' | 'broker' | 'viewer'

export const ROLE_LABELS: Record<UserRole, { label: string; color: string; bg: string; description: string }> = {
  broker_admin: {
    label: 'Администратор',
    color: '#7c3aed',
    bg: '#f3e8ff',
    description: 'Пълен достъп: управление на потребители, фактуриране, настройки',
  },
  broker: {
    label: 'Брокер',
    color: '#2563eb',
    bg: '#dbeafe',
    description: 'Стандартен достъп: създаване и редакция на запитвания, клиенти',
  },
  viewer: {
    label: 'Наблюдател',
    color: '#6b7280',
    bg: '#f3f4f6',
    description: 'Само за четене: преглед на запитвания, клиенти, PDF файлове',
  },
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export type Permission =
  | 'submissions.create'
  | 'submissions.edit'
  | 'submissions.delete'
  | 'submissions.view'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  | 'clients.view'
  | 'comparisons.create'
  | 'comparisons.view'
  | 'pdf.download'
  | 'pdf.preview'
  | 'settings.view'
  | 'settings.edit'
  | 'settings.billing'
  | 'users.manage'
  | 'users.invite'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  broker_admin: [
    'submissions.create', 'submissions.edit', 'submissions.delete', 'submissions.view',
    'clients.create', 'clients.edit', 'clients.delete', 'clients.view',
    'comparisons.create', 'comparisons.view',
    'pdf.download', 'pdf.preview',
    'settings.view', 'settings.edit', 'settings.billing',
    'users.manage', 'users.invite',
  ],
  broker: [
    'submissions.create', 'submissions.edit', 'submissions.delete', 'submissions.view',
    'clients.create', 'clients.edit', 'clients.view',
    'comparisons.create', 'comparisons.view',
    'pdf.download', 'pdf.preview',
    'settings.view',
  ],
  viewer: [
    'submissions.view',
    'clients.view',
    'comparisons.view',
    'pdf.download', 'pdf.preview',
  ],
}

export function hasPermission(role: UserRole | string | undefined, permission: Permission): boolean {
  if (!role) return false
  const perms = ROLE_PERMISSIONS[role as UserRole]
  if (!perms) return false
  return perms.includes(permission)
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

// ─── Team member interface ───────────────────────────────────────────────────

export interface TeamMember {
  id: string
  user_id: string
  email: string
  name?: string
  role: UserRole
  status: 'active' | 'invited' | 'disabled'
  invited_at?: string
  last_login_at?: string
}
