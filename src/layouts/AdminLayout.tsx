import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { type AdminOutletContextValue } from '../adminOutletContext'
import { apiClient } from '../api/client'
import { type AdminSession } from '../api/types'
import { clearAdminAccessToken } from '../auth/token'

const drawerWidth = 240

function NavListItem({ to, end, label }: { to: string; end?: boolean; label: string }) {
  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      <NavLink to={to} end={end} style={{ textDecoration: 'none', color: 'inherit' }}>
        {({ isActive }) => (
          <ListItemButton
            selected={isActive}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.25,
              color: isActive ? '#FFFFFF' : '#94A3B8',
              backgroundColor: isActive ? '#1E3A8A' : 'transparent',
              '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#1E3A8A' },
              '&:hover': { backgroundColor: '#1E3A5F' },
            }}
          >
            <ListItemText primary={label} slotProps={{ primary: { variant: 'body2' } }} />
          </ListItemButton>
        )}
      </NavLink>
    </ListItem>
  )
}

export function AdminLayout() {
  const navigate = useNavigate()
  const [session, setSession] = useState<AdminSession | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await apiClient.get<AdminSession>('/session')
        if (!cancelled) setSession(data)
      } catch {
        if (!cancelled) setSession(null)
      } finally {
        if (!cancelled) setSessionReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function signOut() {
    clearAdminAccessToken()
    navigate('/login', { replace: true })
  }

  const outletContext: AdminOutletContextValue = { session, sessionReady }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          background: (t) =>
            `linear-gradient(180deg, ${t.palette.background.paper} 0%, ${t.palette.action.hover} 100%)`,
        }}
      >
        <Toolbar sx={{ gap: 2, py: 0.5, justifyContent: 'space-between' }}>
          <Stack spacing={0.25}>
            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 700, letterSpacing: '0.04em' }}>
              CEBOS · Admin portal
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {sessionReady && session ? `Last login: Active · User ${session.bankAdminUserId}` : 'Loading session...'}
            </Typography>
          </Stack>
          <Button variant="outlined" color="inherit" onClick={signOut} sx={{ textTransform: 'none' }}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              position: 'relative',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: '#0F2044',
              color: '#94A3B8',
            },
          }}
          open
        >
          <List dense sx={{ pt: 1 }}>
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#475569', letterSpacing: 1 }}>
              OVERVIEW
            </Typography>
            <NavListItem to="/dashboard" label="Dashboard" />
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#475569', letterSpacing: 1 }}>
              COMPANIES
            </Typography>
            <NavListItem to="/clients" end label="All Companies" />
            <NavListItem to="/clients/new" label="Onboard Company" />
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#475569', letterSpacing: 1 }}>
              BATCHES
            </Typography>
            <NavListItem to="/batches" end label="Batch Monitor" />
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#475569', letterSpacing: 1 }}>
              SYSTEM
            </Typography>
            <NavListItem to="/config" label="Configuration" />
            <NavListItem to="/audit" label="Audit Log" />
          </List>
        </Drawer>
        <Box component="main" sx={{ flex: 1, py: 3, px: { xs: 2, md: 3 }, overflow: 'auto', bgcolor: 'background.default' }}>
          <Container maxWidth="xl">
            <Outlet context={outletContext} />
          </Container>
        </Box>
      </Box>
    </Box>
  )
}
