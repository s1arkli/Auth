/** 负责声明帖子模块的领域类型和页面视图模型。 */
export type {
  CreateCommentPayload,
  CreatePostPayload,
  ChildCommentDTO,
  ParentCommentDTO,
  PostCommentData,
  PostCommentPayload,
  PostDetailData,
  PostDetailPayload,
  PostListData,
  PostListItemDTO,
  PostListPayload,
  ToggleLikePayload,
} from '@/types/api'

export type PostTopic = 'all' | 'tech' | 'life' | 'chat'

export type PostSortMode = 'latest' | 'hot'

/** 帖子卡片上展示的聚合统计信息。 */
export interface PostStat {
  likes: string
  comments: string
  views: string
  favorites: string
}

/** 帖子列表页直接消费的前端视图模型。 */
export interface PostFeedItem {
  id: number
  uid: number
  author: string
  time: string
  topic: Exclude<PostTopic, 'all'> | null
  title: string
  excerpt: string
  avatar: string
  stats: PostStat
}
