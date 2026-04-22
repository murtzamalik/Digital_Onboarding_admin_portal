import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { type SpringPage } from '../api/types'

type HistoryRow = {
  id: number
  employeeRef: string
  fromStatus: string | null
  toStatus: string
  changedBy: string
  reason: string | null
  createdAt: string
}

const PAGE_SIZE = 25

export function AuditPage() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SpringPage<HistoryRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data: body } = await apiClient.get<SpringPage<HistoryRow>>(
          '/audit/employee-status-history',
          { params: { page, size: PAGE_SIZE, sort: 'createdAt,desc' } },
        )
        if (!cancelled) setData(body)
      } catch {
        if (!cancelled) {
          setError('Could not load audit log.')
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
      <Typography variant="h6" component="h1" gutterBottom>
        Employee status audit
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Recent rows from <code>employee_status_history</code>.
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

      {data && !loading ? (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>When (UTC)</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Transition</TableCell>
                  <TableCell>By</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.createdAt}</TableCell>
                    <TableCell>
                      <Typography component="code" variant="body2">
                        {row.employeeRef}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(row.fromStatus ?? '—') + ' → ' + row.toStatus}
                    </TableCell>
                    <TableCell>{row.changedBy}</TableCell>
                    <TableCell sx={{ maxWidth: 280, wordBreak: 'break-word' }}>{row.reason ?? '—'}</TableCell>
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
    </Box>
  )
}
