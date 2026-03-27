export type {
  CreatePostPayload,
  PostDetailData,
  PostDetailPayload,
  PostListData,
  PostListItemDTO,
  PostListPayload,
} from '@/types/api'

export type PostTopic = 'all' | 'tech' | 'life' | 'chat'

export type PostSortMode = 'latest' | 'hot'

export interface PostStat {
  likes: string
  comments: string
  views: string
  favorites: string
}

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
