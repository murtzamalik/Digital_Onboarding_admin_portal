import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { type AdminSession, type SpringPage, canAmlCompliance } from '../api/types'

type EmployeeRow = {
  id: number
  employeeRef: string
  status: string
  corporateClientId: number
  fullName: string
  amlScreeningStatus: string | null
  amlCaseReference: string | null
}

const PAGE_SIZE = 15

export function AmlPage() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [filter, setFilter] = useState<'AML_CHECK_PENDING' | 'AML_REJECTED'>('AML_REJECTED')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SpringPage<EmployeeRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [busyRef, setBusyRef] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const { data: body } = await apiClient.get<SpringPage<EmployeeRow>>('/employees', {
        params: { page, size: PAGE_SIZE, sort: 'employeeRef,asc', status: filter },
      })
      setData(body)
    } catch {
      setError('Could not load AML queue.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, filter])

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
    void load()
  }, [load])

  async function postAction(path: string, body?: unknown) {
    setMsg(null)
    try {
      await apiClient.post(path, body ?? {})
      setMsg('Updated.')
      await load()
    } catch {
      setMsg('Action failed (wrong status, permissions, or server error).')
    }
  }

  if (session && !canAmlCompliance(session)) {
    return (
      <section className="page">
        <h1>AML</h1>
        <p className="page__error">Your role cannot perform AML compliance actions.</p>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>AML case queue</h1>
      <p className="page__hint">
        Clears write two status-history rows (reopen, then T24). Use Employees for broader search.
      </p>
      <label className="page__label">
        Queue
        <select
          className="page__input"
          value={filter}
          onChange={(e) => {
            setPage(0)
            setFilter(e.target.value as typeof filter)
          }}
        >
          <option value="AML_REJECTED">AML_REJECTED (clear / block)</option>
          <option value="AML_CHECK_PENDING">AML_CHECK_PENDING (reject)</option>
        </select>
      </label>
      {loading ? <p className="page__hint">Loading…</p> : null}
      {error ? <p className="page__error">{error}</p> : null}
      {msg ? <p className="page__hint">{msg}</p> : null}
      {data && !loading ? (
        <table className="data-table" style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Ref</th>
              <th>Name</th>
              <th>AML ref</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.content.length === 0 ? (
              <tr>
                <td colSpan={4} className="data-table__empty">
                  No rows in this queue.
                </td>
              </tr>
            ) : (
              data.content.map((row) => {
                const enc = encodeURIComponent(row.employeeRef)
                return (
                  <tr key={row.id}>
                    <td>
                      <code>{row.employeeRef}</code>
                    </td>
                    <td>{row.fullName}</td>
                    <td>{row.amlCaseReference ? <code>{row.amlCaseReference}</code> : '—'}</td>
                    <td>
                      {row.status === 'AML_REJECTED' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="page__button"
                            disabled={busyRef === row.employeeRef}
                            onClick={async () => {
                              setBusyRef(row.employeeRef)
                              await postAction(`/employees/${enc}/aml/clear`)
                              setBusyRef(null)
                            }}
                          >
                            Clear to T24
                          </button>
                          <button
                            type="button"
                            className="page__button"
                            disabled={busyRef === row.employeeRef}
                            onClick={async () => {
                              setBusyRef(row.employeeRef)
                              await postAction(`/employees/${enc}/aml/block`)
                              setBusyRef(null)
                            }}
                          >
                            Confirm block
                          </button>
                        </div>
                      ) : null}
                      {row.status === 'AML_CHECK_PENDING' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <input
                            className="page__input"
                            placeholder="Rejection reason"
                            value={rejectReason[row.employeeRef] ?? ''}
                            onChange={(e) =>
                              setRejectReason((r) => ({ ...r, [row.employeeRef]: e.target.value }))
                            }
                          />
                          <button
                            type="button"
                            className="page__button"
                            disabled={
                              busyRef === row.employeeRef ||
                              !(rejectReason[row.employeeRef] ?? '').trim()
                            }
                            onClick={async () => {
                              setBusyRef(row.employeeRef)
                              await postAction(`/employees/${enc}/aml/reject`, {
                                reason: (rejectReason[row.employeeRef] ?? '').trim(),
                              })
                              setBusyRef(null)
                            }}
                          >
                            Reject (AML_REJECTED)
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      ) : null}
      {data && !loading && data.totalPages > 1 ? (
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
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  )
}
