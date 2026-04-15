import { type FormEvent, useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { type AdminSession, type SpringPage, isSuperAdmin } from '../api/types'

type ConfigRow = {
  id: number
  configKey: string
  configValue: string | null
  valueType: string
  description: string | null
  updatedBy: string | null
  updatedAt: string
}

const PAGE_SIZE = 30

export function ConfigPage() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SpringPage<ConfigRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

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
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data: body } = await apiClient.get<SpringPage<ConfigRow>>('/config', {
          params: { page, size: PAGE_SIZE, sort: 'configKey,asc' },
        })
        if (!cancelled) setData(body)
      } catch {
        if (!cancelled) {
          setError('Could not load configuration.')
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

  async function saveRow(e: FormEvent) {
    e.preventDefault()
    if (editId == null) return
    setMsg(null)
    try {
      await apiClient.patch(`/config/${editId}`, { configValue: editValue })
      setMsg('Saved.')
      setEditId(null)
      const { data: body } = await apiClient.get<SpringPage<ConfigRow>>('/config', {
        params: { page, size: PAGE_SIZE, sort: 'configKey,asc' },
      })
      setData(body)
    } catch {
      setMsg('Save failed (SUPER_ADMIN only).')
    }
  }

  const superUser = isSuperAdmin(session)

  return (
    <section className="page">
      <h1>System configuration</h1>
      <p className="page__hint">Keys from <code>system_configuration</code>. Updates require SUPER_ADMIN.</p>
      {loading ? <p className="page__hint">Loading…</p> : null}
      {error ? <p className="page__error">{error}</p> : null}
      {msg ? <p className="page__hint">{msg}</p> : null}
      {editId != null && superUser ? (
        <form className="page__form" onSubmit={saveRow} style={{ marginBottom: '1rem' }}>
          <label className="page__label">
            New value
            <textarea
              className="page__input"
              rows={3}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          </label>
          <button className="page__button" type="submit">
            Save
          </button>
          <button type="button" className="page__button" onClick={() => setEditId(null)}>
            Cancel
          </button>
        </form>
      ) : null}
      {data && !loading ? (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Type</th>
                <th>Updated</th>
                {superUser ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {data.content.map((row) => (
                <tr key={row.id}>
                  <td>
                    <code>{row.configKey}</code>
                  </td>
                  <td style={{ maxWidth: '24rem', wordBreak: 'break-word' }}>
                    {row.configValue ?? '—'}
                  </td>
                  <td>{row.valueType}</td>
                  <td>
                    <span className="page__hint">{row.updatedBy ?? '—'}</span>
                  </td>
                  {superUser ? (
                    <td>
                      <button
                        type="button"
                        className="page__button"
                        onClick={() => {
                          setEditId(row.id)
                          setEditValue(row.configValue ?? '')
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  ) : null}
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
