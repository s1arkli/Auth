/** 负责对外暴露 HTTP（超文本传输协议）请求能力的统一入口。 */
export { postForm, postJson } from '@/lib/http/client'
export type { PostRequestOptions } from '@/lib/http/types'
