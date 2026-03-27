import type { PostFeedItem, PostSortMode, PostTopic } from '@/features/post'
import type { PostListItemDTO } from '@/types/api'

const shortDateFormatter = new Intl.DateTimeFormat('zh-CN', {
  month: 'numeric',
  day: 'numeric',
})

export function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  }

  return String(value)
}

export function formatRelativeTime(unixSeconds: number) {
  if (!unixSeconds) {
    return '刚刚'
  }

  const diff = Date.now() - unixSeconds * 1000
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  }
  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))} 分钟前`
  }
  if (diff < day) {
    return `${Math.max(1, Math.floor(diff / hour))} 小时前`
  }
  if (diff < 7 * day) {
    return `${Math.max(1, Math.floor(diff / day))} 天前`
  }

  return shortDateFormatter.format(new Date(unixSeconds * 1000))
}

export function getPostTypeByTopic(topic: PostTopic) {
  if (topic === 'tech') {
    return 1
  }
  if (topic === 'life') {
    return 2
  }
  if (topic === 'chat') {
    return 3
  }
  return 0
}

export function getSortValue(sortMode: PostSortMode) {
  if (sortMode === 'hot') {
    return 1
  }
  return 2
}

export function mapPostItem(item: PostListItemDTO, topic: PostTopic): PostFeedItem {
  const postId = item.postId ?? item.post_id ?? 0
  const createdAt = item.createdAt ?? item.created_at ?? 0
  const likeCount = item.likeCount ?? item.like_count ?? 0
  const commentCount = item.commentCount ?? item.comment_count ?? 0
  const viewCount = item.viewCount ?? item.view_count ?? 0
  const collectCount = item.collectCount ?? item.collect_count ?? 0

  return {
    id: postId,
    uid: item.uid,
    author: item.nickname || `用户 ${item.uid}`,
    time: formatRelativeTime(createdAt),
    topic: topic === 'all' ? null : topic,
    title: item.title,
    excerpt: item.summary || '这篇帖子还没有摘要。',
    avatar: item.avatar,
    stats: {
      likes: formatCount(likeCount),
      comments: formatCount(commentCount),
      views: formatCount(viewCount),
      favorites: formatCount(collectCount),
    },
  }
}
