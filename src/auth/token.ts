const ACCESS_KEY = 'cebos_admin_access_token'
const REFRESH_KEY = 'cebos_admin_refresh_token'

export function getAdminAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_KEY)
}

export function setAdminAccessToken(token: string): void {
  sessionStorage.setItem(ACCESS_KEY, token)
}

export function clearAdminAccessToken(): void {
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}

export function getAdminRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_KEY)
}

export function setAdminTokens(accessToken: string, refreshToken: string): void {
  sessionStorage.setItem(ACCESS_KEY, accessToken)
  sessionStorage.setItem(REFRESH_KEY, refreshToken)
}
