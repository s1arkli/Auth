/** 负责声明用户模块的接口类型和页面资料模型。 */
export type {
  BatchUserInfoData,
  BatchUserInfoPayload,
  UpdateUserData,
  UpdateUserPayload,
  UploadAvatarData,
} from '@/types/api'

/** 当前前端页面通用的用户资料视图模型。 */
export interface UserProfile {
  uid: number
  nickname: string
  avatar: string
}
