/** 负责封装帖子列表、详情和发帖接口。 */
import { postJson } from '@/lib/http/client'
import type {
  CreateCommentPayload,
  PostCommentData,
  PostCommentPayload,
  CreatePostPayload,
  PostDetailData,
  PostDetailPayload,
  PostListData,
  PostListPayload,
  ToggleLikePayload,
} from '@/features/post/types/post.types'

const postBaseCandidates = ['/api/v1/post', '/post']

/**
 * @description 获取帖子列表，并兼容网关路径和服务直连路径。
 * @param payload PostListPayload，分页、分类和排序条件。
 * @returns Promise<PostListData>，后端返回的帖子列表数据。
 */
export function fetchPostList(payload: PostListPayload) {
  return postJson<PostListData, PostListPayload>('/list', payload, {
    baseCandidates: postBaseCandidates,
  })
}

/**
 * @description 获取帖子详情。
 * @param payload PostDetailPayload，帖子 ID（标识）查询参数。
 * @returns Promise<PostDetailData>，帖子详情数据。
 */
export function fetchPostDetail(payload: PostDetailPayload) {
  return postJson<PostDetailData, PostDetailPayload>('/detail', payload, {
    baseCandidates: postBaseCandidates,
  })
}

/**
 * @description 获取帖子评论列表。
 * @param payload PostCommentPayload，帖子 ID、游标和分页大小。
 * @returns Promise<PostCommentData>，评论列表和是否还有更多数据。
 */
export function fetchPostComment(payload: PostCommentPayload) {
  return postJson<PostCommentData, PostCommentPayload>('/comment', payload, {
    baseCandidates: postBaseCandidates,
  })
}

/**
 * @description 发表评论或回复。
 * @param payload CreateCommentPayload，评论内容和关联帖子/父评论信息。
 * @param accessToken string，登录成功后拿到的访问令牌。
 * @returns Promise<Record<string, never>>，当前接口无业务数据时返回空对象。
 */
export function createComment(payload: CreateCommentPayload, accessToken: string) {
  return postJson<Record<string, never>, CreateCommentPayload>('/comment/create', payload, {
    accessToken,
    baseCandidates: postBaseCandidates,
  })
}

/**
 * @description 点赞或取消点赞帖子/评论。
 * @param payload ToggleLikePayload，点赞目标 ID 和目标类型。
 * @param accessToken string，登录成功后拿到的访问令牌。
 * @returns Promise<Record<string, never>>，当前接口无业务数据时返回空对象。
 */
export function toggleLike(payload: ToggleLikePayload, accessToken: string) {
  return postJson<Record<string, never>, ToggleLikePayload>('/like', payload, {
    accessToken,
    baseCandidates: postBaseCandidates,
  })
}

/**
 * @description 调用发帖接口创建新帖子。
 * @param payload CreatePostPayload，帖子标题、正文和分类编号。
 * @param accessToken string，登录成功后拿到的访问令牌。
 * @returns Promise<Record<string, never>>，当前接口无业务数据时返回空对象。
 */
export function createPost(payload: CreatePostPayload, accessToken: string) {
  return postJson<Record<string, never>, CreatePostPayload>('/create', payload, {
    accessToken,
    baseCandidates: postBaseCandidates,
  })
}
