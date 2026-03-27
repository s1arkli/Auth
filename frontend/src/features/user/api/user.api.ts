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

export function fetchBatchUserInfo(payload: BatchUserInfoPayload) {
  return postJson<BatchUserInfoData, BatchUserInfoPayload>('/batch', payload, {
    baseCandidates: userBaseCandidates,
  })
}

export function updateUserProfile(payload: UpdateUserPayload) {
  return postJson<UpdateUserData, UpdateUserPayload>('/update', payload, {
    baseCandidates: userBaseCandidates,
  })
}

export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return postForm<UploadAvatarData>('/upload/avatar', formData, {
    baseCandidates: resourceBaseCandidates,
  })
}
