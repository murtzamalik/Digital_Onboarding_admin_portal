import axios from 'axios'
import {
  clearAdminAccessToken,
  getAdminAccessToken,
  getAdminRefreshToken,
  setAdminTokens,
} from '../auth/token'
import { runtimeConfig } from '../config/runtime'

export const apiClient = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAdminAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }
    if (error.response?.status !== 401 || String(originalRequest.url ?? '').includes('/auth/refresh')) {
      return Promise.reject(error)
    }
    const refreshToken = getAdminRefreshToken()
    if (!refreshToken) {
      clearAdminAccessToken()
      return Promise.reject(error)
    }
    originalRequest._retry = true
    try {
      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${runtimeConfig.apiBaseUrl}/auth/refresh`,
        { refreshToken },
      )
      setAdminTokens(data.accessToken, data.refreshToken)
      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      clearAdminAccessToken()
      return Promise.reject(refreshError)
    }
  },
)
