import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import {
  type AdminSession,
  canAmlCompliance,
  canMutateClients,
  isSuperAdmin,
} from '../api/types'
import { clearAdminAccessToken } from '../auth/token'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link'

export function AdminLayout() {
  const navigate = useNavigate()
  const [session, setSession] = useState<AdminSession | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await apiClient.get<AdminSession>('/session')
        if (!cancelled) setSession(data)
      } catch {
        if (!cancelled) setSession(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function signOut() {
    clearAdminAccessToken()
    navigate('/login', { replace: true })
  }

  const showNewClient = canMutateClients(session)
  const showAml = canAmlCompliance(session)
  const showAdminUsers = isSuperAdmin(session)

  return (
    <div className="admin-shell">
      <header className="admin-shell__header">
        <strong className="admin-shell__brand">Admin portal</strong>
        {session ? (
          <span className="page__hint" style={{ marginRight: '1rem' }}>
            User <code>{session.bankAdminUserId}</code>
          </span>
        ) : null}
        <button type="button" className="admin-shell__logout" onClick={signOut}>
          Sign out
        </button>
      </header>
      <div className="admin-shell__body">
        <nav className="admin-shell__nav" aria-label="Main">
          <ul>
            <li>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/clients" end className={navLinkClass}>
                Clients
              </NavLink>
            </li>
            {showNewClient ? (
              <li>
                <NavLink to="/clients/new" className={navLinkClass}>
                  New client
                </NavLink>
              </li>
            ) : null}
            <li>
              <NavLink to="/employees" className={navLinkClass}>
                Employees
              </NavLink>
            </li>
            {showAml ? (
              <li>
                <NavLink to="/aml" className={navLinkClass}>
                  AML
                </NavLink>
              </li>
            ) : null}
            <li>
              <NavLink to="/config" className={navLinkClass}>
                Config
              </NavLink>
            </li>
            <li>
              <NavLink to="/audit" className={navLinkClass}>
                Audit
              </NavLink>
            </li>
            {showAdminUsers ? (
              <li>
                <NavLink to="/admin-users" className={navLinkClass}>
                  Admin users
                </NavLink>
              </li>
            ) : null}
          </ul>
        </nav>
        <div className="admin-shell__main">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
