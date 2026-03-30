/** 负责汇总导出用户模块的接口、页面和类型。 */
export {
  fetchBatchUserInfo,
  updateUserProfile,
  uploadAvatar,
} from '@/features/user/api/user.api'
export { ProfilePage } from '@/features/user/components/ProfilePage'
export type {
  BatchUserInfoData,
  BatchUserInfoPayload,
  UpdateUserData,
  UpdateUserPayload,
  UploadAvatarData,
  UserProfile,
} from '@/features/user/types/user.types'
