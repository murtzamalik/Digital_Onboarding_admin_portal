import { Alert, Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useParams } from 'react-router-dom'

const filterTabs = ['All', 'Opened', 'Pending', 'Failed'] as const

export function BatchDetailPage() {
  const { batchRef } = useParams<{ batchRef: string }>()

  return (
    <Stack spacing={2}>
      <Typography variant="body2">
        <Button component={RouterLink} to="/batches" variant="text" sx={{ p: 0, minWidth: 0 }}>
          ← Back to Batch Monitor
        </Button>
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">Batch Detail</Typography>
            <Typography component="code" variant="body2">
              {batchRef ?? 'Unknown batch'}
            </Typography>
          </Box>
          <Chip color="warning" size="small" label="PROCESSING" />
        </Stack>
      </Paper>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Total Uploaded
          </Typography>
          <Typography variant="h5">420</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Invites Sent
          </Typography>
          <Typography variant="h5">412</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Accounts Opened
          </Typography>
          <Typography variant="h5">318</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Failed
          </Typography>
          <Typography variant="h5">14</Typography>
        </Paper>
      </Stack>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Overall Progress
        </Typography>
        <LinearProgress variant="determinate" value={74} sx={{ height: 10, borderRadius: 6, bgcolor: '#E2E8F0' }} />
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#16A34A' }}>
            Opened 74%
          </Typography>
          <Typography variant="caption" sx={{ color: '#D97706' }}>
            Pending 24%
          </Typography>
          <Typography variant="caption" sx={{ color: '#DC2626' }}>
            Failed 2%
          </Typography>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {filterTabs.map((item) => (
            <Button key={item} variant={item === 'All' ? 'contained' : 'outlined'} size="small">
              {item}
            </Button>
          ))}
        </Stack>
      </Paper>
      <Alert severity="info">
        Batch employee detail for admin is waiting on dedicated admin batch APIs. Corporate batch APIs are already
        available separately.
      </Alert>
    </Stack>
  )
}
