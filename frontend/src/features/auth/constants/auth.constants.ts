import type { AuthCopyContent, AuthMode } from '@/features/auth/types/auth.types'

export const authStorageKey = 'mono.auth'

export const authContentMap: Record<AuthMode, AuthCopyContent> = {
  login: {
    heroTitle: '先登录，再进入你的工作空间。',
    formTitle: '欢迎回来',
    formSubtitle: '使用你的 mono 账号登录',
    hint: '登录成功后会直接进入帖子页，并带上 access token 继续联调受保护接口。',
    button: '登录',
    footPrefix: '还没有账号？',
    footAction: '立即注册',
  },
  register: {
    heroTitle: '创建账号，进入 mono 的受保护体验。',
    formTitle: '创建你的账号',
    formSubtitle: '仅需几步，即可进入登录后的工作页面',
    hint: '注册成功后保留在当前页，便于你继续验证登录接口是否正常。',
    button: '创建账号',
    footPrefix: '已经有账号？',
    footAction: '去登录',
  },
}
