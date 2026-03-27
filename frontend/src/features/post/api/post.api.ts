import { postJson } from '@/lib/http/client'
import type {
  CreatePostPayload,
  PostDetailData,
  PostDetailPayload,
  PostListData,
  PostListPayload,
} from '@/features/post/types/post.types'

const postBaseCandidates = ['/api/v1/post', '/post']

export function fetchPostList(payload: PostListPayload) {
  return postJson<PostListData, PostListPayload>('/list', payload, {
    baseCandidates: postBaseCandidates,
  })
}

export function fetchPostDetail(payload: PostDetailPayload) {
  return postJson<PostDetailData, PostDetailPayload>('/detail', payload, {
    baseCandidates: postBaseCandidates,
  })
}

export function createPost(payload: CreatePostPayload, accessToken: string) {
  return postJson<Record<string, never>, CreatePostPayload>('/create', payload, {
    accessToken,
    baseCandidates: postBaseCandidates,
  })
}
