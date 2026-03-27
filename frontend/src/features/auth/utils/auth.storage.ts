import { authStorageKey } from '@/features/auth/constants/auth.constants'
import type { AuthSuccessState } from '@/features/auth/types/auth.types'

export function readPersistedAuth(): AuthSuccessState | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(authStorageKey)
    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as Partial<AuthSuccessState>
    if (!parsed.accessToken || !parsed.account) {
      return null
    }

    return {
      account: parsed.account,
      accessToken: parsed.accessToken,
      ...(parsed.refreshToken ? { refreshToken: parsed.refreshToken } : {}),
      ...(typeof parsed.uid === 'number' ? { uid: parsed.uid } : {}),
      ...(typeof parsed.nickname === 'string' ? { nickname: parsed.nickname } : {}),
      ...(typeof parsed.avatar === 'string' ? { avatar: parsed.avatar } : {}),
    }
  } catch {
    return null
  }
}

export function persistAuthState(authState: AuthSuccessState | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (!authState) {
    window.localStorage.removeItem(authStorageKey)
    return
  }

  window.localStorage.setItem(authStorageKey, JSON.stringify(authState))
}
