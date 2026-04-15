export type AdminSession = {
  bankAdminUserId: number
  authorities: string[]
}

export type SpringPage<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export function hasAuthority(session: AdminSession | null, role: string): boolean {
  const a = role.startsWith('ROLE_') ? role : `ROLE_${role}`
  return session?.authorities?.includes(a) ?? false
}

export function canMutateClients(session: AdminSession | null): boolean {
  return (
    hasAuthority(session, 'SUPER_ADMIN') ||
    hasAuthority(session, 'OPS_MANAGER') ||
    hasAuthority(session, 'OPS_STAFF')
  )
}

export function canAmlCompliance(session: AdminSession | null): boolean {
  return hasAuthority(session, 'SUPER_ADMIN') || hasAuthority(session, 'COMPLIANCE_OFFICER')
}

export function isSuperAdmin(session: AdminSession | null): boolean {
  return hasAuthority(session, 'SUPER_ADMIN')
}
