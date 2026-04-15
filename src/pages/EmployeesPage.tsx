import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { type SpringPage } from '../api/types'

type EmployeeRow = {
  id: number
  employeeRef: string
  status: string
  corporateClientId: number
  fullName: string
  amlScreeningStatus: string | null
  amlCaseReference: string | null
}

const PAGE_SIZE = 20

export function EmployeesPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [appliedQ, setAppliedQ] = useState('')
  const [data, setData] = useState<SpringPage<EmployeeRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const params: Record<string, string | number> = { page, size: PAGE_SIZE, sort: 'employeeRef,asc' }
        if (status) params.status = status
        if (appliedQ.trim()) params.q = appliedQ.trim()
        const { data: body } = await apiClient.get<SpringPage<EmployeeRow>>('/employees', { params })
        if (!cancelled) setData(body)
      } catch {
        if (!cancelled) {
          setError('Could not load employees.')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [page, status, appliedQ])

  return (
    <section className="page">
      <h1>Employees</h1>
      <p className="page__hint">Global search over onboarding records (paged).</p>
      <div className="page__form" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
        <label className="page__label">
          Status
          <select
            className="page__input"
            value={status}
            onChange={(e) => {
              setPage(0)
              setStatus(e.target.value)
            }}
          >
            <option value="">Any</option>
            <option value="AML_CHECK_PENDING">AML_CHECK_PENDING</option>
            <option value="AML_REJECTED">AML_REJECTED</option>
            <option value="INVITED">INVITED</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="T24_PENDING">T24_PENDING</option>
          </select>
        </label>
        <label className="page__label">
          Search (ref / name)
          <input
            className="page__input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="E2E-EMP-001"
          />
        </label>
        <button
          type="button"
          className="page__button"
          onClick={() => {
            setPage(0)
            setAppliedQ(q)
          }}
        >
          Apply
        </button>
      </div>
      {loading ? <p className="page__hint">Loading…</p> : null}
      {error ? <p className="page__error">{error}</p> : null}
      {data && !loading ? (
        <>
          <p className="page__hint">
            Page {data.number + 1} of {Math.max(1, data.totalPages)} · {data.totalElements} rows
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Name</th>
                <th>Status</th>
                <th>Client</th>
                <th>AML</th>
              </tr>
            </thead>
            <tbody>
              {data.content.length === 0 ? (
                <tr>
                  <td colSpan={5} className="data-table__empty">
                    No rows.
                  </td>
                </tr>
              ) : (
                data.content.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <code>{row.employeeRef}</code>
                    </td>
                    <td>{row.fullName}</td>
                    <td>{row.status}</td>
                    <td>{row.corporateClientId}</td>
                    <td>
                      {row.amlCaseReference ? <code>{row.amlCaseReference}</code> : '—'}{' '}
                      <span className="page__hint">{row.amlScreeningStatus ?? ''}</span>
                    </td>
                  </tr>
                ))
              )}
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
