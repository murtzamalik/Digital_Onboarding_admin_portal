import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'

type Summary = {
  corporateClientCount: number
  uploadBatchCount: number
  correctionBatchCount: number
  employeesInProgressCount: number
}

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data } = await apiClient.get<Summary>('/dashboard/summary')
        if (!cancelled) {
          setSummary(data)
        }
      } catch {
        if (!cancelled) {
          setError('Could not load dashboard summary. Sign in or check the API.')
          setSummary(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="page">
      <h1>Dashboard</h1>
      {loading ? <p className="page__hint">Loading…</p> : null}
      {error ? <p className="page__error">{error}</p> : null}
      {summary && !loading ? (
        <dl className="dashboard-stats">
          <div className="dashboard-stats__row">
            <dt>Corporate clients</dt>
            <dd>{summary.corporateClientCount}</dd>
          </div>
          <div className="dashboard-stats__row">
            <dt>Upload batches</dt>
            <dd>{summary.uploadBatchCount}</dd>
          </div>
          <div className="dashboard-stats__row">
            <dt>Correction batches</dt>
            <dd>{summary.correctionBatchCount}</dd>
          </div>
          <div className="dashboard-stats__row">
            <dt>Employees in progress</dt>
            <dd>{summary.employeesInProgressCount}</dd>
          </div>
        </dl>
      ) : null}
      <p className="page__hint">
        Status-driven backend: counts come from <code>/api/v1/admin/dashboard/summary</code>.
      </p>
    </section>
  )
}
