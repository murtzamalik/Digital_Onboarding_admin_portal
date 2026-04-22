import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
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
import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
import { useAdminOutletContext } from '../adminOutletContext'
import { apiClient } from '../api/client'
import { type SpringPage, isSuperAdmin } from '../api/types'

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
  const { session, sessionReady } = useAdminOutletContext()
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SpringPage<ConfigRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editRow, setEditRow] = useState<ConfigRow | null>(null)
  const [editValue, setEditValue] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const superUser = sessionReady && isSuperAdmin(session)

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
    if (editRow == null) return
    setMsg(null)
    try {
      await apiClient.patch(`/config/${editRow.id}`, { configValue: editValue })
      setMsg('Saved.')
      setEditRow(null)
      const { data: body } = await apiClient.get<SpringPage<ConfigRow>>('/config', {
        params: { page, size: PAGE_SIZE, sort: 'configKey,asc' },
      })
      setData(body)
    } catch {
      setMsg('Save failed (SUPER_ADMIN only).')
    }
  }

  const shell = (children: ReactNode) => (
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
      {children}
    </Box>
  )

  if (!sessionReady) {
    return shell(
      <Stack spacing={2} sx={{ flexDirection: 'row', alignItems: 'center', py: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      </Stack>,
    )
  }

  return shell(
    <>
      <Typography variant="h6" component="h1" gutterBottom>
        System configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Keys from <code>system_configuration</code>. Updates require SUPER_ADMIN.
      </Typography>

      {loading ? (
        <Stack spacing={1} sx={{ py: 2, flexDirection: 'row', alignItems: 'center' }}>
          <CircularProgress size={22} />
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
      {msg ? (
        <Alert severity={msg.includes('failed') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {msg}
        </Alert>
      ) : null}

      <Dialog open={editRow != null && superUser} onClose={() => setEditRow(null)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={saveRow}>
          <DialogTitle>Edit value</DialogTitle>
          <DialogContent>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {editRow?.configKey}
            </Typography>
            <TextField
              autoFocus
              multiline
              minRows={3}
              fullWidth
              label="New value"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button type="button" variant="outlined" onClick={() => setEditRow(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {data && !loading ? (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Updated</TableCell>
                  {superUser ? <TableCell align="right"> </TableCell> : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography component="code" variant="body2">
                        {row.configKey}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 360, wordBreak: 'break-word' }}>{row.configValue ?? '—'}</TableCell>
                    <TableCell>{row.valueType}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {row.updatedBy ?? '—'}
                      </Typography>
                    </TableCell>
                    {superUser ? (
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setEditRow(row)
                            setEditValue(row.configValue ?? '')
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    ) : null}
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
    </>,
  )
}
