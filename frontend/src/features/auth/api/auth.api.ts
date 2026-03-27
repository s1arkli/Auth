import { postJson } from '@/lib/http/client'
import type { LoginData, LoginPayload, RegisterPayload } from '@/features/auth/types/auth.types'

export function login(payload: LoginPayload) {
  return postJson<LoginData, LoginPayload>('/login', payload)
}

export function register(payload: RegisterPayload) {
  return postJson<string, RegisterPayload>('/register', payload)
}
