import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../api/client'
import { type AdminSession, canMutateClients } from '../api/types'

type CreatedClient = {
  id: number
  publicId: string
  clientCode: string
  legalName: string
  status: string
}

export function NewClientPage() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [message, setMessage] = useState<string | null>(null)
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const clientCode = String(fd.get('clientCode') ?? '').trim()
    const legalName = String(fd.get('legalName') ?? '').trim()
    if (!clientCode || !legalName) {
      setMessage('Client code and legal name are required.')
      return
    }
    setMessage(null)
    setBusy(true)
    try {
      const { data } = await apiClient.post<CreatedClient>('/clients', { clientCode, legalName })
      setMessage(`Created client #${data.id} (${data.publicId}).`)
      form.reset()
    } catch {
      setMessage('Create failed (duplicate code or validation error).')
    } finally {
      setBusy(false)
    }
  }

  if (session && !canMutateClients(session)) {
    return (
      <section className="page">
        <h1>New client</h1>
        <p className="page__error">Your role cannot create corporate clients.</p>
        <p>
          <Link to="/clients">← Clients</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>New corporate client</h1>
      <p className="page__hint">
        <Link to="/clients">← All clients</Link>
      </p>
      <form className="page__form" onSubmit={onSubmit}>
        <label className="page__label">
          Client code
          <input className="page__input" name="clientCode" required maxLength={64} />
        </label>
        <label className="page__label">
          Legal name
          <input className="page__input" name="legalName" required maxLength={512} />
        </label>
        {message ? <p className="page__hint">{message}</p> : null}
        <button className="page__button" type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create client'}
        </button>
      </form>
    </section>
  )
}
