import { postJson } from '../lib/http'
import type { LoginData, LoginPayload, RegisterPayload } from '../types/api'

export function login(payload: LoginPayload) {
  return postJson<LoginData, LoginPayload>('/login', payload)
}

export function register(payload: RegisterPayload) {
  return postJson<string, RegisterPayload>('/register', payload)
}

