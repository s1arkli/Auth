/** 负责声明后端接口的公共返回结构和跨模块 DTO（数据传输对象）类型。 */
export interface ApiResponse<T> {
  code: number
  msg: string
  data?: T
}

export interface LoginPayload {
  account: string
  password: string
}

export interface LoginData {
  accessToken: string
  uid: number
  nickname: string
  avatar: string
}

export interface RegisterPayload {
  account: string
  password: string
}

export interface AuthSuccessState {
  account: string
  accessToken: string
  refreshToken?: string
  uid?: number
  nickname?: string
  avatar?: string
}

export interface PostListPayload {
  page: number
  pageSize: number
  postType: number
  sort: number
}

export interface PostListItemDTO {
  title: string
  summary: string
  post_id?: number
  postId?: number
  uid: number
  avatar: string
  nickname: string
  like_count?: number
  likeCount?: number
  collect_count?: number
  collectCount?: number
  comment_count?: number
  commentCount?: number
  view_count?: number
  viewCount?: number
  is_liked?: boolean
  isLiked?: boolean
  is_topped?: boolean
  isTopped?: boolean
  created_at?: number
  createdAt?: number
}

export interface PostListData {
  posts?: PostListItemDTO[]
  total?: number
}

export interface CreatePostPayload {
  title: string
  content: string
  post_type: number
}

export interface PostDetailPayload {
  postId: number
}

export interface PostDetailData {
  title: string
  content: string
  uid: number
  avatar: string
  nickname: string
  like_count?: number
  likeCount?: number
  collect_count?: number
  collectCount?: number
  view_count?: number
  viewCount?: number
  is_liked?: boolean
  isLiked?: boolean
}

export interface PostCommentPayload {
  postId: number
  cursor: number
  pageSize: number
}

export interface CreateCommentPayload {
  postId: number
  content: string
  parentId?: number
  replyUid?: number
}

export interface ToggleLikePayload {
  targetId: number
  targetType: 1 | 2
}

export interface ChildCommentDTO {
  comment_id?: number
  commentId?: number
  uid: number
  reply_uid?: number
  replyUid?: number
  content: string
  created_at?: number
  createdAt?: number
  is_liked?: boolean
  isLiked?: boolean
}

export interface ParentCommentDTO {
  comment_id?: number
  commentId?: number
  uid: number
  content: string
  children_comment?: ChildCommentDTO[]
  childrenComment?: ChildCommentDTO[]
  reply_count?: number
  replyCount?: number
  created_at?: number
  createdAt?: number
  is_liked?: boolean
  isLiked?: boolean
}

export interface PostCommentData {
  parent_comment?: ParentCommentDTO[]
  parentComment?: ParentCommentDTO[]
  has_more?: boolean
  hasMore?: boolean
}

export interface BatchUserInfoPayload {
  uids: number[]
}

export interface UserInfoDTO {
  uid: number
  nickname: string
  avatar: string
}

export interface BatchUserInfoData {
  users?: Record<string, UserInfoDTO>
}

export interface UpdateUserPayload {
  uid: number
  nickname: string
  avatar: string
}

export type UpdateUserData = string

export interface UploadAvatarData {
  url: string
}
