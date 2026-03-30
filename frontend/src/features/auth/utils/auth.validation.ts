/** 负责执行登录和注册表单的同步校验。 */
import type { AuthMode, AuthValidationResult } from '@/features/auth/types/auth.types'

/**
 * @description 校验认证表单的账号和密码输入是否合法。
 * @param mode AuthMode，当前表单模式，决定是否启用注册密码长度校验。
 * @param account string，用户输入的账号。
 * @param password string，用户输入的密码。
 * @returns AuthValidationResult | null，校验失败信息；通过时返回 null。
 */
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
