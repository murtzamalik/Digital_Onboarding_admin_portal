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
        Dashboard
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

      {summary && !loading ? (
        <Stack
          spacing={2}
          sx={{
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {statItems.map(({ key, label }) => (
            <Paper key={key} variant="outlined" sx={{ flex: '1 1 160px', p: 2, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {label}
              </Typography>
              <Typography variant="h5" component="p" sx={{ mt: 0.5, fontWeight: 600 }}>
                {summary[key]}
              </Typography>
            </Paper>
          ))}
        </Stack>
      ) : null}

      <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0 }}>
        Status-driven backend: counts come from <code>/api/v1/admin/dashboard/summary</code>.
      </Typography>
    </Box>
  )
}
