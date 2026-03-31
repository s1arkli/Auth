/** 负责维护认证模块的本地存储键和页面文案。 */
import type { AuthCopyContent, AuthMode } from '@/features/auth/types/auth.types'

export const authStorageKey = 'mono.auth'

/** 登录和注册模式对应的界面文案配置。 */
export const authContentMap: Record<AuthMode, AuthCopyContent> = {
  login: {
    heroTitle: '欢迎回来，登录开始探索。',
    formTitle: '欢迎回来',
    formSubtitle: '使用你的 mono 账号登录',
    hint: '登录成功后将自动跳转到帖子页。',
    button: '登录',
    footPrefix: '还没有账号？',
    footAction: '立即注册',
  },
  register: {
    heroTitle: '加入 mono，发现更多精彩。',
    formTitle: '创建你的账号',
    formSubtitle: '仅需几步，即可开始使用',
    hint: '注册成功后请使用新账号登录。',
    button: '创建账号',
    footPrefix: '已经有账号？',
    footAction: '去登录',
  },
}
