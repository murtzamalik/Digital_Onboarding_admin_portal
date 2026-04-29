import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link as MuiLink,
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
import { Link as RouterLink } from 'react-router-dom'
import { apiClient } from '../api/client'

type CorporateClientRow = {
  id: number
  publicId: string
  clientCode: string
  legalName: string
  status: string
}

type SpringPage<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const PAGE_SIZE = 20

export function ClientsPage() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SpringPage<CorporateClientRow> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data: body } = await apiClient.get<SpringPage<CorporateClientRow>>('/clients', {
          params: {
            page,
            size: PAGE_SIZE,
            sort: 'legalName,asc',
          },
        })
        if (!cancelled) {
          setData(body)
        }
      } catch {
        if (!cancelled) {
          setError('Could not load clients. Sign in or check the API.')
          setData(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
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
        Companies
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Corporate client directory with onboarding status and quick access.
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {data.totalElements} client{data.totalElements === 1 ? '' : 's'} (page {data.number + 1} of{' '}
            {Math.max(1, data.totalPages)}).
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 11, letterSpacing: 0.5 }}>COMPANY</TableCell>
                  <TableCell sx={{ fontSize: 11, letterSpacing: 0.5 }}>CODE</TableCell>
                  <TableCell sx={{ fontSize: 11, letterSpacing: 0.5 }}>STATUS</TableCell>
                  <TableCell sx={{ fontSize: 11, letterSpacing: 0.5 }}>PUBLIC ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                      No clients yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.content.map((row, index) => (
                    <TableRow key={row.id} hover sx={{ backgroundColor: index % 2 === 1 ? '#FAFBFC' : '#FFFFFF' }}>
                      <TableCell>
                        <MuiLink component={RouterLink} to={`/clients/${row.id}`} underline="hover">
                          {row.legalName}
                        </MuiLink>
                      </TableCell>
                      <TableCell>{row.clientCode}</TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 10,
                            bgcolor: row.status === 'ACTIVE' ? '#DCFCE7' : '#F1F5F9',
                            color: row.status === 'ACTIVE' ? '#16A34A' : '#64748B',
                            fontWeight: 600,
                          }}
                        >
                          {row.status}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography component="code" variant="body2">
                          {row.publicId}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={1} sx={{ mb: 2, flexDirection: 'row' }}>
            <Button
              variant="outlined"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
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

      <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0 }}>
        Data from <code>/api/v1/admin/clients</code> (paged).
      </Typography>
    </Box>
  )
}
