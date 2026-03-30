/** 负责把后端帖子 DTO（数据传输对象）转换成前端展示数据。 */
import type { PostFeedItem, PostSortMode, PostTopic } from '@/features/post'
import type { PostListItemDTO } from '@/types/api'

const shortDateFormatter = new Intl.DateTimeFormat('zh-CN', {
  month: 'numeric',
  day: 'numeric',
})

/**
 * @description 把点赞、浏览等大数字压缩成论坛卡片更容易扫读的展示格式。
 * @param value number，原始统计值。
 * @returns string，适合直接展示的短格式字符串。
 */
export function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  }

  return String(value)
}

/**
 * @description 把 Unix 时间戳转换成“刚刚”“3 小时前”这类相对时间。
 * @param unixSeconds number，秒级 Unix 时间戳。
 * @returns string，适合帖子卡片展示的时间文案。
 */
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

/**
 * @description 把论坛分类映射成后端约定的帖子类型编号。
 * @param topic PostTopic，前端使用的帖子分类。
 * @returns number，对应后端接口的 postType（帖子类型）值。
 */
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

/**
 * @description 把前端排序模式映射成后端接口使用的排序编号。
 * @param sortMode PostSortMode，前端排序模式。
 * @returns number，后端接口约定的排序值。
 */
export function getSortValue(sortMode: PostSortMode) {
  if (sortMode === 'hot') {
    return 1
  }
  return 2
}

/**
 * @description 把帖子列表接口返回的 DTO（数据传输对象）转换成论坛卡片使用的视图数据。
 * @param item PostListItemDTO，后端返回的单条帖子数据。
 * @param topic PostTopic，当前列表筛选的分类。
 * @returns PostFeedItem，供列表页面直接渲染的帖子卡片数据。
 */
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
