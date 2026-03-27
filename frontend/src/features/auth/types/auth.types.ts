export type {
  AuthSuccessState,
  LoginData,
  LoginPayload,
  RegisterPayload,
} from '@/types/api'

export type AuthMode = 'login' | 'register'

export interface AuthCopyContent {
  heroTitle: string
  formTitle: string
  formSubtitle: string
  hint: string
  button: string
  footPrefix: string
  footAction: string
}

export interface AuthValidationResult {
  field: 'account' | 'password' | 'agreement'
  message: string
}
