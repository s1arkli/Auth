/** 负责封装用户资料和头像上传相关接口。 */
import { postForm, postJson } from '@/lib/http/client'
import type {
  BatchUserInfoData,
  BatchUserInfoPayload,
  UpdateUserData,
  UpdateUserPayload,
  UploadAvatarData,
} from '@/features/user/types/user.types'

const userBaseCandidates = ['/api/v1/user', '/user']
const resourceBaseCandidates = ['/api/v1/resource', '/resource']

/**
 * @description 批量获取用户信息，主要用于帖子详情等需要补齐昵称的场景。
 * @param payload BatchUserInfoPayload，待查询的用户 ID（标识）列表。
 * @returns Promise<BatchUserInfoData>，按用户 ID 组织的用户信息结果。
 */
export function fetchBatchUserInfo(payload: BatchUserInfoPayload) {
  return postJson<BatchUserInfoData, BatchUserInfoPayload>('/batch', payload, {
    baseCandidates: userBaseCandidates,
  })
}

/**
 * @description 提交用户昵称和头像更新请求。
 * @param payload UpdateUserPayload，用户 ID、昵称和头像地址。
 * @returns Promise<UpdateUserData>，后端返回的更新结果消息。
 */
export function updateUserProfile(payload: UpdateUserPayload) {
  return postJson<UpdateUserData, UpdateUserPayload>('/update', payload, {
    baseCandidates: userBaseCandidates,
  })
}

/**
 * @description 上传头像文件并返回可持久化保存的图片地址。
 * @param file File，用户确认裁剪后的头像文件。
 * @returns Promise<UploadAvatarData>，上传完成后的资源地址。
 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return postForm<UploadAvatarData | string>('/upload/avatar', formData, {
    baseCandidates: resourceBaseCandidates,
  }).then((result) => {
    if (typeof result === 'string') {
      return { url: result }
    }

    return result
  })
}
