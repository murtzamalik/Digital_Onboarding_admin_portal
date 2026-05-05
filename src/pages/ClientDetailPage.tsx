import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
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
import axios from 'axios'
import { type FormEvent, type ReactNode, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAdminOutletContext } from '../adminOutletContext'
import { apiClient } from '../api/client'
import { canMutateClients, type SpringPage } from '../api/types'

type CorporateClientDetail = {
  id: number
  publicId: string
  clientCode: string
  legalName: string
  status: string
  createdAt: string
  updatedAt: string
}

type CorporatePortalUserRow = {
  id: number
  email: string
  fullName: string
  role: string
  status: string
}

const USERS_PAGE_SIZE = 100

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      sx={{
        py: 1,
        borderBottom: 1,
        borderColor: 'divider',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: { sm: 140 }, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: { sm: 'right' }, wordBreak: 'break-word' }}>
        {children}
      </Typography>
    </Stack>
  )
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const clientIdNum = id ? Number.parseInt(id, 10) : NaN
  const { session, sessionReady } = useAdminOutletContext()

  const [detail, setDetail] = useState<CorporateClientDetail | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)

  const [users, setUsers] = useState<SpringPage<CorporatePortalUserRow> | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [usersLoading, setUsersLoading] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [createBusy, setCreateBusy] = useState(false)
  const [createMessage, setCreateMessage] = useState<string | null>(null)
  const [role, setRole] = useState<'ADMIN' | 'VIEWER'>('ADMIN')

  const loadUsers = useCallback(async () => {
    if (!id || Number.isNaN(clientIdNum)) return
    setUsersError(null)
    setUsersLoading(true)
    try {
      const { data } = await apiClient.get<SpringPage<CorporatePortalUserRow>>(
        `/clients/${id}/users`,
        {
          params: {
            page: 0,
            size: USERS_PAGE_SIZE,
            sort: 'email,asc',
          },
        },
      )
      setUsers(data)
    } catch {
      setUsers(null)
      setUsersError('Could not load company users.')
    } finally {
      setUsersLoading(false)
    }
  }, [id, clientIdNum])

  useEffect(() => {
    if (!id || Number.isNaN(clientIdNum)) {
      setDetailError('Missing client id.')
      setDetailLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setDetailError(null)
      setDetailLoading(true)
      try {
        const { data } = await apiClient.get<CorporateClientDetail>(`/clients/${id}`)
        if (!cancelled) {
          setDetail(data)
        }
      } catch (e) {
        if (!cancelled) {
          setDetail(null)
          if (axios.isAxiosError(e) && e.response?.status === 404) {
            setDetailError('Client not found.')
          } else {
            setDetailError('Could not load client. Sign in or check the API.')
          }
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, clientIdNum])

  useEffect(() => {
    if (!detail || !id || Number.isNaN(clientIdNum)) return
    void loadUsers()
  }, [detail, id, clientIdNum, loadUsers])

  async function onCreateUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id || !canMutateClients(session)) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const email = String(fd.get('email') ?? '').trim()
    const fullName = String(fd.get('fullName') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    if (!email || !fullName || password.length < 8) {
      setCreateMessage('Email, full name, and password (min 8 characters) are required.')
      return
    }
    setCreateMessage(null)
    setCreateBusy(true)
    try {
      await apiClient.post<CorporatePortalUserRow>(`/clients/${id}/users`, {
        email,
        fullName,
        password,
        role,
      })
      form.reset()
      setRole('ADMIN')
      setAddOpen(false)
      await loadUsers()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        if (status === 409) {
          setCreateMessage('That email is already registered for this company.')
        } else if (status === 400) {
          setCreateMessage('Invalid input. Check role and password length.')
        } else {
          setCreateMessage('Create failed. Try again or check your permissions.')
        }
      } else {
        setCreateMessage('Create failed.')
      }
    } finally {
      setCreateBusy(false)
    }
  }

  const canCreate = sessionReady && canMutateClients(session)

  return (
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
      <Typography variant="body2" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/clients" underline="hover">
          ← Back to clients
        </MuiLink>
      </Typography>
      <Typography variant="h6" component="h1" gutterBottom>
        Company detail
      </Typography>

      {detailLoading ? (
        <Stack spacing={1} sx={{ py: 2, flexDirection: 'row', alignItems: 'center' }}>
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        </Stack>
      ) : null}
      {detailError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {detailError}
        </Alert>
      ) : null}

      {detail && !detailLoading ? (
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6">{detail.legalName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {detail.clientCode} · {detail.publicId}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" disabled>
                  Deactivate
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!canCreate}
                  onClick={() => {
                    setCreateMessage(null)
                    setAddOpen(true)
                  }}
                >
                  + Add user
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Box sx={{ maxWidth: 680 }}>
            <DetailRow label="ID">{detail.id}</DetailRow>
            <DetailRow label="Public ID">
              <Typography component="code" variant="body2">
                {detail.publicId}
              </Typography>
            </DetailRow>
            <DetailRow label="Client code">{detail.clientCode}</DetailRow>
            <DetailRow label="Legal name">{detail.legalName}</DetailRow>
            <DetailRow label="Status">{detail.status}</DetailRow>
            <DetailRow label="Created">{detail.createdAt}</DetailRow>
            <DetailRow label="Updated">{detail.updatedAt}</DetailRow>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Corporate portal users
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Users sign in to the corporate portal with these accounts.
            </Typography>
            {usersLoading ? (
              <Stack spacing={1} sx={{ py: 1, flexDirection: 'row', alignItems: 'center' }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Loading users…
                </Typography>
              </Stack>
            ) : null}
            {usersError ? (
              <Alert severity="warning" sx={{ mb: 1 }}>
                {usersError}
              </Alert>
            ) : null}
            {users && !usersLoading ? (
              <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: 900 }}>
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
                    {users.content.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="body2" color="text.secondary">
                            No users yet. Use &quot;Add user&quot; to create the first portal account.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.content.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.fullName}</TableCell>
                          <TableCell>{u.role}</TableCell>
                          <TableCell>{u.status}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null}
          </Box>
        </Stack>
      ) : null}

      {!canCreate && sessionReady && detail && !detailLoading ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Your role can view users but not create them. Ask an operations admin to add the first portal user.
        </Alert>
      ) : null}

      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 3, mb: 0 }}>
        Company: <code>{'/api/v1/admin/clients/{id}'}</code> · Users:{' '}
        <code>{'/api/v1/admin/clients/{id}/users'}</code>
      </Typography>

      <Dialog
        open={addOpen}
        onClose={() => {
          if (!createBusy) setAddOpen(false)
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add corporate portal user</DialogTitle>
        <Box component="form" onSubmit={onCreateUser} noValidate>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField name="fullName" label="Full name" required fullWidth autoComplete="name" />
              <TextField name="email" label="Email" type="email" required fullWidth autoComplete="email" />
              <TextField
                name="password"
                label="Temporary password"
                type="password"
                required
                fullWidth
                autoComplete="new-password"
                helperText="Minimum 8 characters. User should change after first sign-in."
                slotProps={{ htmlInput: { minLength: 8, maxLength: 128 } }}
              />
              <FormControl fullWidth>
                <InputLabel id="portal-role-label">Role</InputLabel>
                <Select
                  labelId="portal-role-label"
                  label="Role"
                  value={role}
                  onChange={(e: SelectChangeEvent) => setRole(e.target.value as 'ADMIN' | 'VIEWER')}
                >
                  <MenuItem value="ADMIN">ADMIN — full portal access</MenuItem>
                  <MenuItem value="VIEWER">VIEWER — read-only</MenuItem>
                </Select>
              </FormControl>
              {createMessage ? <Alert severity="error">{createMessage}</Alert> : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button type="button" onClick={() => setAddOpen(false)} disabled={createBusy}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={createBusy}>
              {createBusy ? 'Creating…' : 'Create user'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
