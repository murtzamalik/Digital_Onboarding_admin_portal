import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import axios from 'axios'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAdminTokens } from '../auth/token'
import { runtimeConfig } from '../config/runtime'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${runtimeConfig.apiBaseUrl}/auth/login`,
        { email, password },
      )
      setAdminTokens(data.accessToken, data.refreshToken)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Login failed. Check email, password, and that the API is running.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Bank admin login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in with your bank admin credentials.
          </Typography>
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
                fullWidth
              />
              {error ? <Alert severity="error">{error}</Alert> : null}
              <Button type="submit" disabled={busy} fullWidth size="large">
                {busy ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
