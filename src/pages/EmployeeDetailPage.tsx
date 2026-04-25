import {
  Alert,
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Divider,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchAdminEmployeeDetail, type AdminEmployeeDetail } from '../api/employeeDetail'
import { OnboardingStatusChip } from '../components/StatusChip'
import { runtimeConfig } from '../config/runtime'
import { getAdminAccessToken } from '../auth/token'

function Item({ label, value }: { label: string; value: string | number | null | undefined }) {
  const text =
    value === null || value === undefined || String(value).trim() === '' ? '—' : String(value)
  return (
    <Box sx={{ py: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {text}
      </Typography>
    </Box>
  )
}

export function EmployeeDetailPage() {
  const { employeeRef } = useParams<{ employeeRef: string }>()
  const [detail, setDetail] = useState<AdminEmployeeDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const imageUrls = useMemo(() => {
    if (!employeeRef) return null
    const base = runtimeConfig.apiBaseUrl
    const token = getAdminAccessToken()
    if (!token) return null
    const enc = encodeURIComponent(employeeRef)
    return {
      front: `${base}/employees/${enc}/images/front`,
      back: `${base}/employees/${enc}/images/back`,
      selfie: `${base}/employees/${enc}/images/selfie`,
      token,
    }
  }, [employeeRef])

  useEffect(() => {
    if (!employeeRef) return
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const data = await fetchAdminEmployeeDetail(employeeRef)
        if (!cancelled) setDetail(data)
      } catch {
        if (!cancelled) {
          setError('Employee not found or not accessible.')
          setDetail(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [employeeRef])

  return (
    <Stack spacing={2}>
      <Breadcrumbs sx={{ typography: 'body2' }}>
        <MuiLink component={Link} to="/employees" underline="hover" color="inherit">
          Employees
        </MuiLink>
        <Typography color="text.primary">{employeeRef}</Typography>
      </Breadcrumbs>

      {loading ? <Typography color="text.secondary">Loading…</Typography> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      {detail && !loading ? (
        <>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h4" component="h1">
              {detail.fullName}
            </Typography>
            <OnboardingStatusChip status={detail.status} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Ref{' '}
            <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>
              {detail.employeeRef}
            </Typography>
            {' · '}
            Client {detail.corporateClientId} · Batch {detail.batchReference}
          </Typography>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Card variant="outlined" sx={{ flex: '1 1 340px' }}>
              <CardContent>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  Identity
                </Typography>
                <Item label="CNIC" value={detail.cnic} />
                <Item label="Mobile" value={detail.mobile} />
                <Item label="Email" value={detail.email} />
                <Item label="DOB" value={detail.dateOfBirth} />
                <Item label="Gender" value={detail.gender} />
                <Item label="Religion" value={detail.religion} />
                <Item label="Father" value={detail.fatherName} />
                <Item label="Mother" value={detail.motherName} />
                <Item label="CNIC issue" value={detail.cnicIssueDate} />
                <Item label="CNIC expiry" value={detail.cnicExpiryDate} />
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 340px' }}>
              <CardContent>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  Addresses
                </Typography>
                <Item label="Present" value={[detail.presentAddressLine1, detail.presentCity, detail.presentCountry].filter(Boolean).join(', ')} />
                <Item label="Permanent" value={[detail.permanentAddressLine1, detail.permanentCity, detail.permanentCountry].filter(Boolean).join(', ')} />
              </CardContent>
            </Card>
          </Stack>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Card variant="outlined" sx={{ flex: '1 1 340px' }}>
              <CardContent>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  KYC & biometrics
                </Typography>
                <Item label="NADRA txn" value={detail.nadraTransactionId} />
                <Item label="NADRA status" value={detail.nadraVerificationStatus} />
                <Item label="NADRA verified at" value={detail.nadraVerifiedAt} />
                <Item label="Liveness" value={detail.livenessResult} />
                <Item label="Liveness score" value={detail.livenessScore} />
                <Item label="Face match" value={detail.faceMatchResult} />
                <Item label="Face match score" value={detail.faceMatchScore} />
                <Item label="Fingerprint" value={detail.fingerprintMatchResult} />
                <Item label="Fingerprint quality" value={detail.fingerprintQualityScore} />
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 340px' }}>
              <CardContent>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  AML & core banking
                </Typography>
                <Item label="AML status" value={detail.amlScreeningStatus} />
                <Item label="AML case" value={detail.amlCaseReference} />
                <Item label="AML checked" value={detail.amlLastCheckedAt} />
                <Item label="T24 customer" value={detail.t24CustomerId} />
                <Item label="T24 account" value={detail.t24AccountId} />
                <Item label="T24 status" value={detail.t24SubmissionStatus} />
                <Item label="T24 last error" value={detail.t24LastError} />
              </CardContent>
            </Card>
          </Stack>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                Journey & controls
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Item label="Invite sent" value={detail.inviteSentAt} />
                <Item label="Expires" value={detail.expireAt} />
                <Item label="Invite resend count" value={detail.inviteResendCount} />
                <Item label="Quiz score" value={detail.quizScore != null ? `${detail.quizScore}/${detail.quizMaxScore ?? '?'}` : null} />
                <Item label="Quiz passed" value={detail.quizPassed != null ? String(detail.quizPassed) : null} />
                <Item label="OCR status" value={detail.ocrStatus} />
                <Item label="Blocked reason" value={detail.blockReason} />
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Form JSON
              </Typography>
              <Box
                component="pre"
                sx={{
                  mt: 0.5,
                  p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  fontSize: 12,
                  maxHeight: 200,
                  overflow: 'auto',
                }}
              >
                {detail.formDataJson ?? '—'}
              </Box>
              {detail.validationErrors ? (
                <>
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    Validation errors
                  </Typography>
                  <Box component="pre" sx={{ fontSize: 12, color: 'error.main', whiteSpace: 'pre-wrap' }}>
                    {detail.validationErrors}
                  </Box>
                </>
              ) : null}
            </CardContent>
          </Card>

          {detail.hasCnicFrontImage || detail.hasCnicBackImage || detail.hasSelfieImage ? (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                KYC images
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Sensitive — access logged per bank policy.
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {detail.hasCnicFrontImage && imageUrls ? (
                  <Box sx={{ flex: '1 1 240px', maxWidth: 480 }}>
                    <Typography variant="caption">CNIC front</Typography>
                    <AuthImage src={imageUrls.front} token={imageUrls.token} alt="CNIC front" />
                  </Box>
                ) : null}
                {detail.hasCnicBackImage && imageUrls ? (
                  <Box sx={{ flex: '1 1 240px', maxWidth: 480 }}>
                    <Typography variant="caption">CNIC back</Typography>
                    <AuthImage src={imageUrls.back} token={imageUrls.token} alt="CNIC back" />
                  </Box>
                ) : null}
                {detail.hasSelfieImage && imageUrls ? (
                  <Box sx={{ flex: '1 1 240px', maxWidth: 480 }}>
                    <Typography variant="caption">Selfie</Typography>
                    <AuthImage src={imageUrls.selfie} token={imageUrls.token} alt="Selfie" />
                  </Box>
                ) : null}
              </Stack>
            </>
          ) : null}
        </>
      ) : null}
    </Stack>
  )
}

function AuthImage({ src, token, alt }: { src: string; token: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    ;(async () => {
      try {
        const res = await fetch(src, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('bad')
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        if (!cancelled) setUrl(objectUrl)
      } catch {
        if (!cancelled) setErr(true)
      }
    })()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src, token])

  if (err) return <Typography color="error">Could not load image.</Typography>
  if (!url) return <Typography color="text.secondary">Loading…</Typography>
  return (
    <Box
      component="img"
      src={url}
      alt={alt}
      sx={{
        width: '100%',
        maxHeight: 320,
        objectFit: 'contain',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        mt: 0.5,
        display: 'block',
      }}
    />
  )
}
