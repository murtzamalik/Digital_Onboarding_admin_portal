import { Box, Button, Chip, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

type MonitorBatchRow = {
  batchRef: string
  company: string
  uploadedAt: string
  total: number
  invited: number
  opened: number
  failed: number
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PENDING'
}

const rows: MonitorBatchRow[] = [
  {
    batchRef: 'BAT-ENG-20260429-001',
    company: 'Engro',
    uploadedAt: '29 Apr 2026 11:05',
    total: 420,
    invited: 412,
    opened: 318,
    failed: 14,
    status: 'PROCESSING',
  },
  {
    batchRef: 'BAT-HBL-20260428-014',
    company: 'HBL Corp',
    uploadedAt: '28 Apr 2026 16:40',
    total: 190,
    invited: 190,
    opened: 190,
    failed: 0,
    status: 'COMPLETED',
  },
]

function statusColor(status: MonitorBatchRow['status']) {
  if (status === 'COMPLETED') return 'success'
  if (status === 'FAILED') return 'error'
  if (status === 'PROCESSING') return 'warning'
  return 'info'
}

export function BatchMonitorPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h1">
        Batch Monitor
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Total Batches
          </Typography>
          <Typography variant="h5">2</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Processing Now
          </Typography>
          <Typography variant="h5">1</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Completed This Month
          </Typography>
          <Typography variant="h5">1</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Failed
          </Typography>
          <Typography variant="h5">0</Typography>
        </Paper>
      </Stack>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField size="small" fullWidth placeholder="Search batch or company" />
          <Button variant="outlined">Processing</Button>
          <Button variant="outlined">Completed</Button>
          <Button variant="outlined">Failed</Button>
        </Stack>
      </Paper>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Batch ID</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell>Counts</TableCell>
                  <TableCell>Progress</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.batchRef} hover>
                <TableCell>
                  <Typography component="code" variant="body2">
                    {row.batchRef}
                  </Typography>
                </TableCell>
                <TableCell>{row.company}</TableCell>
                <TableCell>{row.uploadedAt}</TableCell>
                <TableCell>
                  {row.total} total / {row.invited} invited / {row.opened} opened / {row.failed} failed
                </TableCell>
                <TableCell sx={{ minWidth: 170 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.round((row.opened / Math.max(1, row.total)) * 100)}
                    sx={{ height: 8, borderRadius: 6, bgcolor: '#E2E8F0' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip size="small" color={statusColor(row.status)} label={row.status} />
                </TableCell>
                <TableCell align="right">
                  <Button component={RouterLink} to={`/batches/${encodeURIComponent(row.batchRef)}`} size="small">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Admin cross-company batch APIs are pending; this page is scaffolded to match the new design.
        </Typography>
      </Box>
    </Stack>
  )
}
