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
import { useCallback, useEffect, useState } from 'react'
import { useAdminOutletContext } from '../adminOutletContext'
import { apiClient } from '../api/client'
import { type SpringPage, canAmlCompliance } from '../api/types'

type EmployeeRow = {
  id: number
  employeeRef: string
  status: string
  corporateClientId: number
  fullName: string
  amlScreeningStatus: string | null
  amlCaseReference: string | null
}

const PAGE_SIZE = 15

export function AmlPage() {
  const { session, sessionReady } = useAdminOutletContext()
  const [filter, setFilter] = useState<'AML_CHECK_PENDING' | 'AML_REJECTED'>('AML_REJECTED')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SpringPage<EmployeeRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [busyRef, setBusyRef] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const { data: body } = await apiClient.get<SpringPage<EmployeeRow>>('/employees', {
        params: { page, size: PAGE_SIZE, sort: 'employeeRef,asc', status: filter },
      })
      setData(body)
    } catch {
      setError('Could not load AML queue.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => {
    if (!sessionReady) return
    if (!session || !canAmlCompliance(session)) {
      setLoading(false)
      setData(null)
      return
    }
    void load()
  }, [load, session, sessionReady])

  async function postAction(path: string, body?: unknown) {
    setMsg(null)
    try {
      await apiClient.post(path, body ?? {})
      setMsg('Updated.')
      await load()
    } catch {
      setMsg('Action failed (wrong status, permissions, or server error).')
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
            AML
          </Typography>
          <Alert severity="warning">Could not load your session. Try signing in again.</Alert>
        </>
      ) : !canAmlCompliance(session) ? (
        <>
          <Typography variant="h6" component="h1" gutterBottom>
            AML
          </Typography>
          <Alert severity="error">Your role cannot perform AML compliance actions.</Alert>
        </>
      ) : (
        <>
          <Typography variant="h6" component="h1" gutterBottom>
            AML case queue
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Clears write two status-history rows (reopen, then T24). Use Employees for broader search.
          </Typography>

          <FormControl size="small" sx={{ minWidth: 320, mb: 2 }}>
            <InputLabel id="aml-queue-label">Queue</InputLabel>
            <Select
              labelId="aml-queue-label"
              label="Queue"
              value={filter}
              onChange={(e) => {
                setPage(0)
                setFilter(e.target.value as typeof filter)
              }}
            >
              <MenuItem value="AML_REJECTED">AML_REJECTED (clear / block)</MenuItem>
              <MenuItem value="AML_CHECK_PENDING">AML_CHECK_PENDING (reject)</MenuItem>
            </Select>
          </FormControl>

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
            <Alert severity={msg.includes('failed') ? 'error' : 'info'} sx={{ mb: 2 }}>
              {msg}
            </Alert>
          ) : null}

          {data && !loading ? (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ref</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>AML ref</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                        No rows in this queue.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.content.map((row) => {
                      const enc = encodeURIComponent(row.employeeRef)
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell>
                            <Typography component="code" variant="body2">
                              {row.employeeRef}
                            </Typography>
                          </TableCell>
                          <TableCell>{row.fullName}</TableCell>
                          <TableCell>
                            {row.amlCaseReference ? (
                              <Typography component="code" variant="body2">
                                {row.amlCaseReference}
                              </Typography>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>
                            {row.status === 'AML_REJECTED' ? (
                              <Stack spacing={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={busyRef === row.employeeRef}
                                  onClick={async () => {
                                    setBusyRef(row.employeeRef)
                                    await postAction(`/employees/${enc}/aml/clear`)
                                    setBusyRef(null)
                                  }}
                                >
                                  Clear to T24
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  disabled={busyRef === row.employeeRef}
                                  onClick={async () => {
                                    setBusyRef(row.employeeRef)
                                    await postAction(`/employees/${enc}/aml/block`)
                                    setBusyRef(null)
                                  }}
                                >
                                  Confirm block
                                </Button>
                              </Stack>
                            ) : null}
                            {row.status === 'AML_CHECK_PENDING' ? (
                              <Stack spacing={1} sx={{ maxWidth: 280 }}>
                                <TextField
                                  size="small"
                                  placeholder="Rejection reason"
                                  value={rejectReason[row.employeeRef] ?? ''}
                                  onChange={(e) =>
                                    setRejectReason((r) => ({ ...r, [row.employeeRef]: e.target.value }))
                                  }
                                />
                                <Button
                                  size="small"
                                  variant="contained"
                                  disabled={
                                    busyRef === row.employeeRef || !(rejectReason[row.employeeRef] ?? '').trim()
                                  }
                                  onClick={async () => {
                                    setBusyRef(row.employeeRef)
                                    await postAction(`/employees/${enc}/aml/reject`, {
                                      reason: (rejectReason[row.employeeRef] ?? '').trim(),
                                    })
                                    setBusyRef(null)
                                  }}
                                >
                                  Reject (AML_REJECTED)
                                </Button>
                              </Stack>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}

          {data && !loading && data.totalPages > 1 ? (
            <Stack spacing={1} sx={{ flexDirection: 'row', mt: 2 }}>
              <Button variant="outlined" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Previous
              </Button>
              <Button variant="outlined" disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </Stack>
          ) : null}
        </>
      )}
    </Box>
  )

  return shell
}
