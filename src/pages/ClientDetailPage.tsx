import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiClient } from '../api/client'

type CorporateClientDetail = {
  id: number
  publicId: string
  clientCode: string
  legalName: string
  status: string
  createdAt: string
  updatedAt: string
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<CorporateClientDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setError('Missing client id.')
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data } = await apiClient.get<CorporateClientDetail>(`/clients/${id}`)
        if (!cancelled) {
          setDetail(data)
        }
      } catch (e) {
        if (!cancelled) {
          setDetail(null)
          if (axios.isAxiosError(e) && e.response?.status === 404) {
            setError('Client not found.')
          } else {
            setError('Could not load client. Sign in or check the API.')
          }
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
  }, [id])

  return (
    <section className="page">
      <p className="page__hint">
        <Link to="/clients">← Back to clients</Link>
      </p>
      <h1>Client detail</h1>
      {loading ? <p className="page__hint">Loading…</p> : null}
      {error ? <p className="page__error">{error}</p> : null}
      {detail && !loading ? (
        <dl className="detail-list">
          <div className="detail-list__row">
            <dt>ID</dt>
            <dd>{detail.id}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Public ID</dt>
            <dd>
              <code>{detail.publicId}</code>
            </dd>
          </div>
          <div className="detail-list__row">
            <dt>Client code</dt>
            <dd>{detail.clientCode}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Legal name</dt>
            <dd>{detail.legalName}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Status</dt>
            <dd>{detail.status}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Created</dt>
            <dd>{detail.createdAt}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Updated</dt>
            <dd>{detail.updatedAt}</dd>
          </div>
        </dl>
      ) : null}
      <p className="page__hint">
        Data from <code>{'/api/v1/admin/clients/{id}'}</code>.
      </p>
    </section>
  )
}
