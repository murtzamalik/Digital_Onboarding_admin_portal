import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminOutletContext } from '../adminOutletContext'
import { apiClient } from '../api/client'
import { canMutateClients } from '../api/types'

type CreatedClient = {
  id: number
  publicId: string
  clientCode: string
  legalName: string
  status: string
}

export function NewClientPage() {
  const { session, sessionReady } = useAdminOutletContext()
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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

  const shell = (
    <Box
      component="section"
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 3,
      }}
    >
      {!sessionReady ? (
        <Stack spacing={2} sx={{ flexDirection: 'row', alignItems: 'center', py: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        </Stack>
      ) : !session ? (
        <>
          <Typography variant="h6" component="h1" gutterBottom>
            New client
          </Typography>
          <Alert severity="warning">Could not load your session. Try signing in again.</Alert>
        </>
      ) : !canMutateClients(session) ? (
        <>
          <Typography variant="h6" component="h1" gutterBottom>
            New client
          </Typography>
          <Alert severity="error">Your role cannot create corporate clients.</Alert>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <MuiLink component={Link} to="/clients" underline="hover">
              ← Clients
            </MuiLink>
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h6" component="h1" gutterBottom>
            New corporate client
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <MuiLink component={Link} to="/clients" underline="hover">
              ← All clients
            </MuiLink>
          </Typography>
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2} sx={{ maxWidth: 420 }}>
              <TextField name="clientCode" label="Client code" required fullWidth slotProps={{ htmlInput: { maxLength: 64 } }} />
              <TextField name="legalName" label="Legal name" required fullWidth slotProps={{ htmlInput: { maxLength: 512 } }} />
              {message ? (
                <Alert severity={message.includes('failed') ? 'error' : 'success'}>{message}</Alert>
              ) : null}
              <Button type="submit" disabled={busy} sx={{ alignSelf: 'flex-start' }}>
                {busy ? 'Creating…' : 'Create client'}
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  )

  return shell
}
