/** 负责声明认证模块对外暴露的类型。 */
export type {
  AuthSuccessState,
  LoginData,
  LoginPayload,
  RegisterPayload,
} from '@/types/api'

export type AuthMode = 'login' | 'register'

/** 认证卡片在不同模式下展示的文案集合。 */
export interface AuthCopyContent {
  heroTitle: string
  formTitle: string
  formSubtitle: string
  hint: string
  button: string
  footPrefix: string
  footAction: string
}

/** 认证表单校验失败时返回的字段定位结果。 */
export interface AuthValidationResult {
  field: 'account' | 'password' | 'agreement'
  message: string
}
