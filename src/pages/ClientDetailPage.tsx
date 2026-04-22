import {
  Alert,
  Box,
  CircularProgress,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material'
import axios from 'axios'
import { type ReactNode, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiClient } from '../api/client'

type CorporateClientDetail = {
  id: number
  publicId: string
  clientCode: string
  legalName: string
  status: string
  createdAt: string
  updatedAt: string
}

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
  const [detail, setDetail] = useState<CorporateClientDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setError('Missing client id.')
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { data } = await apiClient.get<CorporateClientDetail>(`/clients/${id}`)
        if (!cancelled) {
          setDetail(data)
        }
      } catch (e) {
        if (!cancelled) {
          setDetail(null)
          if (axios.isAxiosError(e) && e.response?.status === 404) {
            setError('Client not found.')
          } else {
            setError('Could not load client. Sign in or check the API.')
          }
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
  }, [id])

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
        Client detail
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

      {detail && !loading ? (
        <Box sx={{ maxWidth: 560, mt: 1 }}>
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
      ) : null}

      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 3, mb: 0 }}>
        Data from <code>{'/api/v1/admin/clients/{id}'}</code>.
      </Typography>
    </Box>
  )
}
