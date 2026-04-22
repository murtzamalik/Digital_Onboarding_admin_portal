import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { type FormEvent, useEffect, useState } from 'react'
import { useAdminOutletContext } from '../adminOutletContext'
import { apiClient } from '../api/client'
import { type SpringPage, isSuperAdmin } from '../api/types'

type BankAdminRow = {
  id: number
  email: string
  fullName: string
  role: string
  status: string
}

const PAGE_SIZE = 20

const ROLES = ['SUPER_ADMIN', 'OPS_MANAGER', 'OPS_STAFF', 'COMPLIANCE_OFFICER', 'VIEWER'] as const

export function AdminUsersPage() {
  const { session, sessionReady } = useAdminOutletContext()
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SpringPage<BankAdminRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [formMsg, setFormMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!sessionReady) return
    if (!isSuperAdmin(session)) {
      setData(null)
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data: body } = await apiClient.get<SpringPage<BankAdminRow>>('/bank-admin-users', {
          params: { page, size: PAGE_SIZE, sort: 'email,asc' },
        })
        if (!cancelled) setData(body)
      } catch {
        if (!cancelled) {
          setError('Could not load bank admin users.')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [page, session, sessionReady])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    const fullName = String(fd.get('fullName') ?? '').trim()
    const role = String(fd.get('role') ?? 'VIEWER')
    if (!email || !password || !fullName) {
      setFormMsg('All fields required.')
      return
    }
    setFormMsg(null)
    setBusy(true)
    try {
      await apiClient.post('/bank-admin-users', { email, password, fullName, role })
      setFormMsg('User created.')
      form.reset()
      setPage(0)
      const { data: body } = await apiClient.get<SpringPage<BankAdminRow>>('/bank-admin-users', {
        params: { page: 0, size: PAGE_SIZE, sort: 'email,asc' },
      })
      setData(body)
    } catch {
      setFormMsg('Create failed (duplicate email or invalid role).')
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
            Admin users
          </Typography>
          <Alert severity="warning">Could not load your session. Try signing in again.</Alert>
        </>
      ) : !isSuperAdmin(session) ? (
        <>
          <Typography variant="h6" component="h1" gutterBottom>
            Admin users
          </Typography>
          <Alert severity="error">SUPER_ADMIN only.</Alert>
        </>
      ) : (
        <>
          <Typography variant="h6" component="h1" gutterBottom>
            Bank admin users
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            Create
          </Typography>
          <Box component="form" onSubmit={onCreate}>
            <Stack spacing={2} sx={{ maxWidth: 420, mb: 3 }}>
              <TextField name="email" label="Email" type="email" required fullWidth autoComplete="off" />
              <TextField name="fullName" label="Full name" required fullWidth autoComplete="name" />
              <FormControl fullWidth>
                <InputLabel id="admin-role-label">Role</InputLabel>
                <Select labelId="admin-role-label" label="Role" defaultValue="VIEWER" required name="role">
                  {ROLES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="password"
                label="Password"
                type="password"
                required
                fullWidth
                autoComplete="new-password"
                slotProps={{ htmlInput: { minLength: 8 } }}
              />
              {formMsg ? (
                <Alert severity={formMsg.includes('failed') ? 'error' : 'success'}>{formMsg}</Alert>
              ) : null}
              <Button type="submit" disabled={busy} sx={{ alignSelf: 'flex-start' }}>
                {busy ? 'Creating…' : 'Create'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Directory
          </Typography>
          {loading ? (
            <Stack spacing={1} sx={{ py: 1, flexDirection: 'row', alignItems: 'center' }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading…
              </Typography>
            </Stack>
          ) : null}
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          {data && !loading ? (
            <>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.content.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.fullName}</TableCell>
                        <TableCell>{row.role}</TableCell>
                        <TableCell>{row.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack spacing={1} sx={{ flexDirection: 'row' }}>
                <Button variant="outlined" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  disabled={data.totalPages <= 0 || page >= data.totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </Stack>
            </>
          ) : null}
        </>
      )}
    </Box>
  )

  return shell
}
