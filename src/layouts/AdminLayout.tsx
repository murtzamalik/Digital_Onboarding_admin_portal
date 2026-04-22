import {
  AppBar,
  Box,
  Button,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { type AdminOutletContextValue } from '../adminOutletContext'
import { apiClient } from '../api/client'
import {
  type AdminSession,
  canAmlCompliance,
  canMutateClients,
  isSuperAdmin,
} from '../api/types'
import { clearAdminAccessToken } from '../auth/token'

const drawerWidth = 240

function NavListItem({ to, end, label }: { to: string; end?: boolean; label: string }) {
  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      <NavLink to={to} end={end} style={{ textDecoration: 'none', color: 'inherit' }}>
        {({ isActive }) => (
          <ListItemButton selected={isActive} sx={{ borderRadius: 1, mx: 1, mb: 0.25 }}>
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

  const showNewClient = sessionReady && canMutateClients(session)
  const showAml = sessionReady && canAmlCompliance(session)
  const showAdminUsers = sessionReady && isSuperAdmin(session)

  const outletContext: AdminOutletContextValue = { session, sessionReady }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
            Admin portal
          </Typography>
          {!sessionReady ? (
            <Chip size="small" label="Loading session…" variant="outlined" sx={{ mr: 'auto' }} />
          ) : session ? (
            <Chip size="small" label={`User ${session.bankAdminUserId}`} variant="outlined" sx={{ mr: 'auto' }} />
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
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
              bgcolor: 'background.paper',
            },
          }}
          open
        >
          <List dense sx={{ pt: 1 }}>
            <NavListItem to="/dashboard" label="Dashboard" />
            <NavListItem to="/clients" end label="Clients" />
            {showNewClient ? <NavListItem to="/clients/new" label="New client" /> : null}
            <NavListItem to="/employees" label="Employees" />
            {showAml ? <NavListItem to="/aml" label="AML" /> : null}
            <NavListItem to="/config" label="Config" />
            <NavListItem to="/audit" label="Audit" />
            {showAdminUsers ? <NavListItem to="/admin-users" label="Admin users" /> : null}
          </List>
        </Drawer>
        <Box component="main" sx={{ flex: 1, p: 3, overflow: 'auto', bgcolor: 'background.default' }}>
          <Outlet context={outletContext} />
        </Box>
      </Box>
    </Box>
  )
}
