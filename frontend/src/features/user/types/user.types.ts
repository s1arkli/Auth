export type {
  BatchUserInfoData,
  BatchUserInfoPayload,
  UpdateUserData,
  UpdateUserPayload,
  UploadAvatarData,
} from '@/types/api'

export interface UserProfile {
  uid: number
  nickname: string
  avatar: string
}
