/** 负责汇总导出认证模块的 API（接口）、组件、Hook（钩子）和类型。 */
export { login, register } from '@/features/auth/api/auth.api'
export { authContentMap } from '@/features/auth/constants/auth.constants'
export { AuthCard } from '@/features/auth/components/AuthCard'
export { useAuthController } from '@/features/auth/hooks/useAuthController'
export { persistAuthState, readPersistedAuth } from '@/features/auth/utils/auth.storage'
export { validateAuthForm } from '@/features/auth/utils/auth.validation'
export type {
  AuthCopyContent,
  AuthMode,
  AuthSuccessState,
  AuthValidationResult,
  LoginData,
  LoginPayload,
  RegisterPayload,
} from '@/features/auth/types/auth.types'
