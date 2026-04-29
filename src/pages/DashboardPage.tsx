import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'

type Summary = {
  corporateClientCount: number
  uploadBatchCount: number
  correctionBatchCount: number
  employeesInProgressCount: number
}

const statItems: { key: keyof Summary; label: string }[] = [
  { key: 'corporateClientCount', label: 'Corporate clients' },
  { key: 'uploadBatchCount', label: 'Upload batches' },
  { key: 'correctionBatchCount', label: 'Correction batches' },
  { key: 'employeesInProgressCount', label: 'Employees in progress' },
]

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data } = await apiClient.get<Summary>('/dashboard/summary')
        if (!cancelled) {
          setSummary(data)
        }
      } catch {
        if (!cancelled) {
          setError('Could not load dashboard summary. Sign in or check the API.')
          setSummary(null)
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
  }, [])

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" component="h1" sx={{ mb: 0.5 }}>
        Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back. Here's today's onboarding activity overview.
        </Typography>
      </Box>

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

      {summary && !loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 2 }}>
          {statItems.map(({ key, label }, idx) => {
            const accent = ['#1D4ED8', '#D97706', '#16A34A', '#7C3AED'][idx]
            return (
              <Box key={key}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderLeft: `4px solid ${accent}`,
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="h4" sx={{ lineHeight: 1.1, mt: 0.75 }}>
                    {summary[key]}
                  </Typography>
                </Paper>
              </Box>
            )
          })}
        </Box>
      ) : null}

      <Typography variant="caption" color="text.secondary">
        Status-driven backend: counts come from <code>/api/v1/admin/dashboard/summary</code>.
      </Typography>
    </Stack>
  )
}
