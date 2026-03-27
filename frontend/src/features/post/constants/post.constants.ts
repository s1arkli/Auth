import type { PostSortMode, PostTopic } from '@/features/post'

export const topicOptions: Array<{ key: PostTopic; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'tech', label: '技术' },
  { key: 'life', label: '生活' },
  { key: 'chat', label: '灌水' },
]

export const topicLabels: Record<Exclude<PostTopic, 'all'>, string> = {
  tech: '技术',
  life: '生活',
  chat: '灌水',
}

export const composerTopicOptions: Array<{
  key: Exclude<PostTopic, 'all'>
  label: string
  description: string
}> = [
  { key: 'tech', label: '技术', description: '工程实践、踩坑记录、架构讨论' },
  { key: 'life', label: '生活', description: '日常分享、观察随笔、轻讨论' },
  { key: 'chat', label: '灌水', description: '轻松闲聊、碎片想法、随便说说' },
]

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

export const feedPageSize = 10
