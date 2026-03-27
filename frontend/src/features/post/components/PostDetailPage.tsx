import { startTransition, useEffect, useId, useState } from 'react'
import { fetchPostDetail } from '@/features/post'
import { StatIcon } from '@/features/post/components/PostIcons'
import { fetchBatchUserInfo } from '@/features/user'
import type { ToastState } from '@/components/Toast'
import { isServiceUnavailableError } from '@/lib/http/errors'
import { appLogger } from '@/lib/logger'
import type { PostDetailData } from '@/types/api'
import { buildAvatarStyle } from '@/utils/avatar'

type TopicKey = 'tech' | 'life' | 'chat'

interface PostDetailSource {
  id: number
  uid: number
  author: string
  time: string
  topic: TopicKey | null
  title: string
  excerpt: string
  avatar: string
}

interface PostDetailViewData {
  id: number
  uid: number
  author: string
  avatar: string
  title: string
  content: string
  stats: {
    likes: string
    views: string
    favorites: string
  }
}

interface PostDetailPageProps {
  sourcePost: PostDetailSource
  topicLabel: string
  onBack: () => void
  onToast: (toast: ToastState) => void
}

function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  }

  return String(value)
}

function mapPostDetailItem(postId: number, fallbackAuthor: string, detail: PostDetailData): PostDetailViewData {
  const likeCount = detail.likeCount ?? detail.like_count ?? 0
  const viewCount = detail.viewCount ?? detail.view_count ?? 0
  const collectCount = detail.collectCount ?? detail.collect_count ?? 0

  return {
    id: postId,
    uid: detail.uid,
    author: detail.nickname || fallbackAuthor || `用户 ${detail.uid}`,
    avatar: detail.avatar,
    title: detail.title,
    content: detail.content || '这篇帖子暂时没有正文内容。',
    stats: {
      likes: formatCount(likeCount),
      views: formatCount(viewCount),
      favorites: formatCount(collectCount),
    },
  }
}

export function PostDetailPage({
  sourcePost,
  topicLabel,
  onBack,
  onToast,
}: PostDetailPageProps) {
  const [loading, setLoading] = useState(true)
  const [detailError, setDetailError] = useState('')
  const [detailPost, setDetailPost] = useState<PostDetailViewData | null>(null)
  const titleId = useId()
  const contentParagraphs = detailPost?.content
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)

  useEffect(() => {
    let canceled = false

    async function loadDetail() {
      setLoading(true)
      setDetailError('')
      setDetailPost(null)

      try {
        const detail = await fetchPostDetail({ postId: sourcePost.id })
        let author = detail.nickname || sourcePost.author || `用户 ${detail.uid}`

        try {
          const userInfoResp = await fetchBatchUserInfo({ uids: [detail.uid] })
          const userInfo = userInfoResp.users?.[String(detail.uid)]
          if (userInfo?.nickname) {
            author = userInfo.nickname
          }
        } catch (error) {
          appLogger.log({
            level: 'warn',
            category: 'post',
            action: 'detail_user_info_failed',
            message: '帖子详情页补充用户信息失败，回退到帖子详情返回值',
            context: { postId: sourcePost.id, uid: detail.uid, error },
          })
        }

        if (canceled) {
          return
        }

        startTransition(() => {
          setDetailPost({
            ...mapPostDetailItem(sourcePost.id, sourcePost.author, detail),
            author,
          })
        })
      } catch (error) {
        if (canceled) {
          return
        }

        const message = error instanceof Error ? error.message : '帖子详情加载失败'
        if (isServiceUnavailableError(error)) {
          setDetailError('')
          onToast({ type: 'error', message })
        } else {
          setDetailError(message)
        }
        appLogger.log({
          level: 'error',
          category: 'post',
          action: 'detail_failed',
          message: '帖子详情加载失败',
          context: { postId: sourcePost.id, error },
        })
      } finally {
        if (!canceled) {
          setLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      canceled = true
    }
  }, [onToast, sourcePost])

  return (
    <div className="detail-page">
      <div className="detail-shell">
        <header className="composer-topbar">
          <button className="forum-nav-link" onClick={onBack} type="button">
            返回帖子页
          </button>
          <div className="forum-brand" aria-label="mono forum detail">
            <span className="forum-brand__dot" />
            <span className="forum-brand__text">mono</span>
          </div>
        </header>

        <main className="detail-layout">
          {loading ? (
            <div className="forum-state-panel detail-card" role="status" aria-live="polite">
              正在加载帖子详情…
            </div>
          ) : null}

          {!loading && detailError ? (
            <section className="detail-card">
              <div className="forum-state-panel forum-state-panel--error">
                <p>{detailError}</p>
                {detailError.includes('token is null') ? (
                  <p className="detail-hint">后端当前把详情接口拦成了需要登录，请检查详情路由或鉴权中间件配置。</p>
                ) : null}
                <button className="forum-pill-button forum-pill-button--ghost" onClick={onBack} type="button">
                  返回帖子页
                </button>
              </div>
            </section>
          ) : null}

          {!loading && !detailError && detailPost ? (
            <article className="detail-card">
              <div className="detail-hero">
                <div className="detail-hero__eyebrow">
                  <span className={`forum-topic-badge forum-topic-badge--${sourcePost.topic ?? 'tech'}`}>{topicLabel}</span>
                  <span className="detail-hero__time">{sourcePost.time}</span>
                </div>
                <h1 id={titleId}>{detailPost.title}</h1>
                <p className="detail-hero__deck">{sourcePost.excerpt}</p>
              </div>

              <div className="detail-layout detail-layout--article">
                <div className="detail-content">
                  {contentParagraphs && contentParagraphs.length > 0
                    ? contentParagraphs.map((paragraph, index) => (
                        <p className={index === 0 ? 'detail-content__lead' : undefined} key={`${detailPost.id}-${index}`}>
                          {paragraph}
                        </p>
                      ))
                    : (
                        <p className="detail-content__lead">{detailPost.content}</p>
                      )}
                </div>

                <aside className="detail-sidebar">
                  <div className="detail-author-card">
                    <span className="detail-author-card__avatar" style={buildAvatarStyle(detailPost.avatar, detailPost.uid)} />
                    <div className="detail-author-card__info">
                      <strong>{detailPost.author}</strong>
                      <span>用户 ID {detailPost.uid}</span>
                    </div>
                  </div>

                  <div className="detail-stats-panel">
                    <div className="detail-stat-card">
                      <div className="detail-stat-card__icon">
                        <StatIcon type="like" />
                      </div>
                      <div className="detail-stat-card__body">
                        <span>点赞</span>
                        <strong>{detailPost.stats.likes}</strong>
                      </div>
                    </div>

                    <div className="detail-stat-card">
                      <div className="detail-stat-card__icon">
                        <StatIcon type="view" />
                      </div>
                      <div className="detail-stat-card__body">
                        <span>浏览</span>
                        <strong>{detailPost.stats.views}</strong>
                      </div>
                    </div>

                    <div className="detail-stat-card">
                      <div className="detail-stat-card__icon">
                        <StatIcon type="favorite" />
                      </div>
                      <div className="detail-stat-card__body">
                        <span>收藏</span>
                        <strong>{detailPost.stats.favorites}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="detail-note-card">
                    <span className="detail-note-card__label">阅读提示</span>
                    <p>如果正文内容偏短，通常说明后端当前只返回了精简内容；可以继续检查详情接口字段是否完整。</p>
                  </div>
                </aside>
              </div>
            </article>
          ) : null}
        </main>
      </div>
    </div>
  )
}
