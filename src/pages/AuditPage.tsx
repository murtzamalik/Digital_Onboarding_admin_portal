import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { type SpringPage } from '../api/types'

type HistoryRow = {
  id: number
  employeeRef: string
  fromStatus: string | null
  toStatus: string
  changedBy: string
  reason: string | null
  createdAt: string
}

const PAGE_SIZE = 25

export function AuditPage() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SpringPage<HistoryRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data: body } = await apiClient.get<SpringPage<HistoryRow>>(
          '/audit/employee-status-history',
          { params: { page, size: PAGE_SIZE, sort: 'createdAt,desc' } },
        )
        if (!cancelled) setData(body)
      } catch {
        if (!cancelled) {
          setError('Could not load audit log.')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [page])

  return (
    <section className="page">
      <h1>Employee status audit</h1>
      <p className="page__hint">Recent rows from <code>employee_status_history</code>.</p>
      {loading ? <p className="page__hint">Loading…</p> : null}
      {error ? <p className="page__error">{error}</p> : null}
      {data && !loading ? (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>When (UTC)</th>
                <th>Employee</th>
                <th>Transition</th>
                <th>By</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((row) => (
                <tr key={row.id}>
                  <td>{row.createdAt}</td>
                  <td>
                    <code>{row.employeeRef}</code>
                  </td>
                  <td>
                    {(row.fromStatus ?? '—') + ' → ' + row.toStatus}
                  </td>
                  <td>{row.changedBy}</td>
                  <td style={{ maxWidth: '18rem', wordBreak: 'break-word' }}>
                    {row.reason ?? '—'}
                  </td>
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
