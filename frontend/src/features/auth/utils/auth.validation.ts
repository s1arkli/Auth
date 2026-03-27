import type { AuthMode, AuthValidationResult } from '@/features/auth/types/auth.types'

export function validateAuthForm(mode: AuthMode, account: string, password: string): AuthValidationResult | null {
  const cleanedAccount = account.trim()
  const cleanedPassword = password.trim()

  if (!cleanedAccount) {
    return {
      field: 'account',
      message: '请输入账号',
    }
  }

  if (!cleanedPassword) {
    return {
      field: 'password',
      message: '请输入密码',
    }
  }

  if (mode === 'register' && cleanedPassword.length < 8) {
    return {
      field: 'password',
      message: '注册密码至少需要 8 位字符',
    }
  }

  return null
}
