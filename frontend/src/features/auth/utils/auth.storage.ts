/** 负责读写前端登录态持久化数据。 */
import { authStorageKey } from '@/features/auth/constants/auth.constants'
import type { AuthSuccessState } from '@/features/auth/types/auth.types'

/**
 * @description 从 LocalStorage（浏览器本地存储）读取并校验持久化登录态。
 * @returns AuthSuccessState | null，合法的登录态数据或空值。
 */
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

    // 只回填当前页面真正依赖的字段，避免把未知脏数据继续扩散到内存态。
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

/**
 * @description 把当前登录态写入 LocalStorage（浏览器本地存储），或在退出时清空存储。
 * @param authState AuthSuccessState | null，需要持久化的登录态；传 null 表示删除。
 * @returns void
 */
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
