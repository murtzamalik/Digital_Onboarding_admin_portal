import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../api/client'

type CorporateClientRow = {
  id: number
  publicId: string
  clientCode: string
  legalName: string
  status: string
}

type SpringPage<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const PAGE_SIZE = 20

export function ClientsPage() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SpringPage<CorporateClientRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data: body } = await apiClient.get<SpringPage<CorporateClientRow>>('/clients', {
          params: {
            page,
            size: PAGE_SIZE,
            sort: 'legalName,asc',
          },
        })
        if (!cancelled) {
          setData(body)
        }
      } catch {
        if (!cancelled) {
          setError('Could not load clients. Sign in or check the API.')
          setData(null)
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
  }, [page])

  return (
    <section className="page">
      <h1>Corporate clients</h1>
      {loading ? <p className="page__hint">Loading…</p> : null}
      {error ? <p className="page__error">{error}</p> : null}
      {data && !loading ? (
        <>
          <p className="page__hint">
            {data.totalElements} client{data.totalElements === 1 ? '' : 's'} (page {data.number + 1}{' '}
            of {Math.max(1, data.totalPages)}).
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Legal name</th>
                <th>Code</th>
                <th>Status</th>
                <th>Public ID</th>
              </tr>
            </thead>
            <tbody>
              {data.content.length === 0 ? (
                <tr>
                  <td colSpan={4} className="data-table__empty">
                    No clients yet.
                  </td>
                </tr>
              ) : (
                data.content.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link to={`/clients/${row.id}`}>{row.legalName}</Link>
                    </td>
                    <td>{row.clientCode}</td>
                    <td>{row.status}</td>
                    <td>
                      <code>{row.publicId}</code>
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
      <p className="page__hint">
        Data from <code>/api/v1/admin/clients</code> (paged).
      </p>
    </section>
  )
}
