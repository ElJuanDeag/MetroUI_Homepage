const API_BASE = import.meta.env.VITE_API_BASE_URL || ""
const AUTH_TOKEN_KEY = "metro_auth_token_v1"

export type ApiState = "idle" | "loading" | "ready" | "offline" | "error"

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set("Accept", "application/json")

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const token = getAuthToken()
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }

  return (await response.json()) as T
}

export async function optionalJson<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal
): Promise<T | null> {
  try {
    return await requestJson<T>(path, init, signal)
  } catch {
    return null
  }
}
