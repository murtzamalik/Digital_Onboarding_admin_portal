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
import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { type SpringPage } from '../api/types'

type EmployeeRow = {
  id: number
  employeeRef: string
  status: string
  corporateClientId: number
  fullName: string
  amlScreeningStatus: string | null
  amlCaseReference: string | null
}

const PAGE_SIZE = 20

export function EmployeesPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [appliedQ, setAppliedQ] = useState('')
  const [data, setData] = useState<SpringPage<EmployeeRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const params: Record<string, string | number> = { page, size: PAGE_SIZE, sort: 'employeeRef,asc' }
        if (status) params.status = status
        if (appliedQ.trim()) params.q = appliedQ.trim()
        const { data: body } = await apiClient.get<SpringPage<EmployeeRow>>('/employees', { params })
        if (!cancelled) setData(body)
      } catch {
        if (!cancelled) {
          setError('Could not load employees.')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [page, status, appliedQ])

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
        Employees
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Global search over onboarding records (paged).
      </Typography>

      <Stack spacing={2} sx={{ mb: 3, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="emp-status-label">Status</InputLabel>
          <Select
            labelId="emp-status-label"
            label="Status"
            value={status}
            onChange={(e) => {
              setPage(0)
              setStatus(e.target.value)
            }}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="AML_CHECK_PENDING">AML_CHECK_PENDING</MenuItem>
            <MenuItem value="AML_REJECTED">AML_REJECTED</MenuItem>
            <MenuItem value="INVITED">INVITED</MenuItem>
            <MenuItem value="BLOCKED">BLOCKED</MenuItem>
            <MenuItem value="T24_PENDING">T24_PENDING</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Search (ref / name)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="E2E-EMP-001"
          sx={{ minWidth: 200 }}
        />
        <Button
          type="button"
          variant="outlined"
          onClick={() => {
            setPage(0)
            setAppliedQ(q)
          }}
        >
          Apply
        </Button>
      </Stack>

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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Page {data.number + 1} of {Math.max(1, data.totalPages)} · {data.totalElements} rows
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ref</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>AML</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                      No rows.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.content.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography component="code" variant="body2">
                          {row.employeeRef}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.fullName}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.corporateClientId}</TableCell>
                      <TableCell>
                        {row.amlCaseReference ? (
                          <Typography component="code" variant="body2">
                            {row.amlCaseReference}
                          </Typography>
                        ) : (
                          '—'
                        )}{' '}
                        <Typography component="span" variant="caption" color="text.secondary">
                          {row.amlScreeningStatus ?? ''}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
