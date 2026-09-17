import axios, { AxiosError } from "axios"

export const TOKEN_KEY = "lion.accessToken"

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

export function clearSession() {
  setStoredToken(null)
  delete api.defaults.headers.common.Authorization
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string[]>

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }

  get firstFieldError(): string | null {
    const entry = Object.entries(this.fieldErrors)[0]
    return entry ? entry[1][0] : null
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string
      errors?: Record<string, string[]>
    }>
    const status = axiosError.response?.status ?? 0
    const body = axiosError.response?.data
    return new ApiError(status, body?.message ?? axiosError.message, body?.errors ?? {})
  }
  return new ApiError(0, "Something went wrong. Please try again.")
}
