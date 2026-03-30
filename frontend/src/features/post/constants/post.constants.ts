/** 负责维护帖子模块的筛选项、默认值和文案映射。 */
import type { PostSortMode, PostTopic } from '@/features/post'

/** 帖子分类筛选项，供论坛首页标签栏使用。 */
export const topicOptions: Array<{ key: PostTopic; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'tech', label: '技术' },
  { key: 'life', label: '生活' },
  { key: 'chat', label: '灌水' },
]

/** 非 all 分类对应的中文标签映射。 */
export const topicLabels: Record<Exclude<PostTopic, 'all'>, string> = {
  tech: '技术',
  life: '生活',
  chat: '灌水',
}

/** 发帖页专用分类选项，包含简短的业务说明。 */
export const composerTopicOptions: Array<{
  key: Exclude<PostTopic, 'all'>
  label: string
  description: string
}> = [
  { key: 'tech', label: '技术', description: '工程实践、踩坑记录、架构讨论' },
  { key: 'life', label: '生活', description: '日常分享、观察随笔、轻讨论' },
  { key: 'chat', label: '灌水', description: '轻松闲聊、碎片想法、随便说说' },
]

/** 游客态和登录态进入论坛时使用的默认筛选条件。 */
export const forumDefaults: Record<'guest' | 'member', { topic: PostTopic; sort: PostSortMode }> = {
  guest: {
    topic: 'all',
    sort: 'latest',
  },
  member: {
    topic: 'tech',
    sort: 'hot',
  },
}

/** 帖子列表每页默认拉取数量。 */
export const feedPageSize = 10
