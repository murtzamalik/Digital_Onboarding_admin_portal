import { type FormEvent, useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { type AdminSession, type SpringPage, isSuperAdmin } from '../api/types'

type BankAdminRow = {
  id: number
  email: string
  fullName: string
  role: string
  status: string
}

const PAGE_SIZE = 20

const ROLES = ['SUPER_ADMIN', 'OPS_MANAGER', 'OPS_STAFF', 'COMPLIANCE_OFFICER', 'VIEWER'] as const

export function AdminUsersPage() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SpringPage<BankAdminRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [formMsg, setFormMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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

  useEffect(() => {
    if (!isSuperAdmin(session)) {
      setData(null)
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data: body } = await apiClient.get<SpringPage<BankAdminRow>>('/bank-admin-users', {
          params: { page, size: PAGE_SIZE, sort: 'email,asc' },
        })
        if (!cancelled) setData(body)
      } catch {
        if (!cancelled) {
          setError('Could not load bank admin users.')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [page, session])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    const fullName = String(fd.get('fullName') ?? '').trim()
    const role = String(fd.get('role') ?? 'VIEWER')
    if (!email || !password || !fullName) {
      setFormMsg('All fields required.')
      return
    }
    setFormMsg(null)
    setBusy(true)
    try {
      await apiClient.post('/bank-admin-users', { email, password, fullName, role })
      setFormMsg('User created.')
      form.reset()
      setPage(0)
      const { data: body } = await apiClient.get<SpringPage<BankAdminRow>>('/bank-admin-users', {
        params: { page: 0, size: PAGE_SIZE, sort: 'email,asc' },
      })
      setData(body)
    } catch {
      setFormMsg('Create failed (duplicate email or invalid role).')
    } finally {
      setBusy(false)
    }
  }

  if (session && !isSuperAdmin(session)) {
    return (
      <section className="page">
        <h1>Admin users</h1>
        <p className="page__error">SUPER_ADMIN only.</p>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>Bank admin users</h1>
      <h2 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>Create</h2>
      <form className="page__form" onSubmit={onCreate}>
        <label className="page__label">
          Email
          <input className="page__input" name="email" type="email" required />
        </label>
        <label className="page__label">
          Full name
          <input className="page__input" name="fullName" required />
        </label>
        <label className="page__label">
          Role
          <select className="page__input" name="role" defaultValue="VIEWER">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="page__label">
          Password
          <input className="page__input" name="password" type="password" minLength={8} required />
        </label>
        {formMsg ? <p className="page__hint">{formMsg}</p> : null}
        <button className="page__button" type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create'}
        </button>
      </form>
      <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Directory</h2>
      {loading ? <p className="page__hint">Loading…</p> : null}
      {error ? <p className="page__error">{error}</p> : null}
      {data && !loading ? (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((row) => (
                <tr key={row.id}>
                  <td>{row.email}</td>
                  <td>{row.fullName}</td>
                  <td>{row.role}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pager">
            <button
              type="button"
              className="page__button pager__btn"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="page__button pager__btn"
              disabled={data.totalPages <= 0 || page >= data.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
