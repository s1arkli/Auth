/** 负责渲染帖子详情页，并接入评论列表接口。 */
import { startTransition, useEffect, useId, useState } from 'react'
import type { ToastState } from '@/components/Toast'
import { createComment, fetchPostComment, fetchPostDetail, toggleLike } from '@/features/post/api/post.api'
import { StatIcon } from '@/features/post/components/PostIcons'
import type { ParentCommentDTO, PostCommentData, PostDetailData } from '@/features/post/types/post.types'
import { formatCount, formatRelativeTime } from '@/features/post/utils/post.utils'
import { fetchBatchUserInfo } from '@/features/user/api/user.api'
import type { UserProfile } from '@/features/user/types/user.types'
import { isServiceUnavailableError } from '@/lib/http/errors'
import { appLogger } from '@/lib/logger'
import type { UserInfoDTO } from '@/types/api'
import { buildAvatarStyle } from '@/utils/avatar'

type TopicKey = 'tech' | 'life' | 'chat'

const commentPageSize = 8

interface PostDetailSource {
  id: number
  uid: number
  author: string
  time: string
  topic: TopicKey | null
  title: string
  excerpt: string
  avatar: string
  stats: {
    likes: string
    comments: string
    views: string
    favorites: string
  }
}

interface DetailAuthorViewData {
  uid: number
  name: string
  avatar: string
}

interface PostDetailViewData {
  id: number
  title: string
  excerpt: string
  content: string
  author: DetailAuthorViewData
  stats: {
    likes: number
    comments: number
    views: number
    favorites: number
    isLiked: boolean
  }
}

interface CommentReplyViewData {
  id: number
  author: DetailAuthorViewData
  replyToName: string
  time: string
  content: string
  isLiked: boolean
}

interface CommentViewData {
  id: number
  author: DetailAuthorViewData
  time: string
  content: string
  replyCount: number
  isLiked: boolean
  replies: CommentReplyViewData[]
}

interface ArticleBlock {
  type: 'lead' | 'paragraph' | 'note' | 'code'
  title?: string
  content?: string
  items?: string[]
}

interface PostDetailPageData {
  post: PostDetailViewData
  articleBlocks: ArticleBlock[]
  comments: CommentViewData[]
  commentsHasMore: boolean
}

interface PostDetailPageProps {
  sourcePost: PostDetailSource
  topicLabel: string
  accessToken?: string | null
  currentProfile?: UserProfile | null
  onBack: () => void
  onPostMutated: () => void
  onRequireAuth: () => void
  onToast: (toast: ToastState) => void
}

function getUserInfo(
  userMap: Record<string, UserInfoDTO>,
  uid: number,
  fallbackName: string,
  fallbackAvatar: string,
) {
  const matchedUser = userMap[String(uid)]

  return {
    uid,
    name: matchedUser?.nickname || fallbackName || `用户 ${uid}`,
    avatar: matchedUser?.avatar || fallbackAvatar || '',
  }
}

function normalizeParentComments(commentData: PostCommentData | null) {
  return commentData?.parentComment ?? commentData?.parent_comment ?? []
}

function parseCountLabel(label: string) {
  const normalized = label.trim().toLowerCase()
  if (!normalized) {
    return null
  }

  if (/^\d+$/.test(normalized)) {
    return Number(normalized)
  }

  if (/^\d+(\.\d+)?k$/.test(normalized)) {
    return Math.round(Number(normalized.replace('k', '')) * 1000)
  }

  return null
}

function resolveCommentCountValue(sourceLabel: string, comments: CommentViewData[]) {
  const parsedValue = parseCountLabel(sourceLabel)
  if (parsedValue !== null) {
    return parsedValue
  }

  return comments.reduce((total, item) => total + 1 + item.replies.length, 0)
}

function collectUserIds(detail: PostDetailData, parentComments: ParentCommentDTO[]) {
  const userIds = new Set<number>()
  userIds.add(detail.uid)

  parentComments.forEach((parent) => {
    userIds.add(parent.uid)

    const children = parent.childrenComment ?? parent.children_comment ?? []
    children.forEach((child) => {
      userIds.add(child.uid)
      const replyUid = child.replyUid ?? child.reply_uid ?? 0
      if (replyUid > 0) {
        userIds.add(replyUid)
      }
    })
  })

  return [...userIds]
}

function mapComments(
  commentData: PostCommentData | null,
  userMap: Record<string, UserInfoDTO>,
) {
  return normalizeParentComments(commentData).map((parent, index) => {
    const parentId = parent.commentId ?? parent.comment_id ?? index + 1
    const parentAuthor = getUserInfo(userMap, parent.uid, `用户 ${parent.uid}`, '')
    const children = parent.childrenComment ?? parent.children_comment ?? []

    return {
      id: parentId,
      author: parentAuthor,
      time: formatRelativeTime(parent.createdAt ?? parent.created_at ?? 0),
      content: parent.content || '这条评论暂时没有内容。',
      replyCount: parent.replyCount ?? parent.reply_count ?? children.length,
      isLiked: Boolean(parent.isLiked ?? parent.is_liked),
      replies: children.map((child, childIndex) => {
        const childId = child.commentId ?? child.comment_id ?? parentId * 100 + childIndex + 1
        const replyUid = child.replyUid ?? child.reply_uid ?? 0

        return {
          id: childId,
          author: getUserInfo(userMap, child.uid, `用户 ${child.uid}`, ''),
          replyToName: replyUid > 0 ? getUserInfo(userMap, replyUid, `用户 ${replyUid}`, '').name : '',
          time: formatRelativeTime(child.createdAt ?? child.created_at ?? 0),
          content: child.content || '这条回复暂时没有内容。',
          isLiked: Boolean(child.isLiked ?? child.is_liked),
        }
      }),
    } satisfies CommentViewData
  })
}

function isCodeBlock(block: string) {
  const trimmed = block.trim()
  if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
    return true
  }

  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length < 3) {
    return false
  }

  const signalPattern = /(ctx\b|err\b|resp\b|return\b|func\b|package\b|logger\.|context\.|:=|==|!=|&&|\|\||[{}()[\]])/
  const matchedCount = lines.reduce((count, line) => (signalPattern.test(line) ? count + 1 : count), 0)
  return matchedCount >= Math.min(3, lines.length)
}

function stripCodeFence(block: string) {
  return block
    .trim()
    .replace(/^```[\w-]*\n?/, '')
    .replace(/\n?```$/, '')
    .trim()
}

function buildArticleBlocks(content: string) {
  const rawBlocks = content
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (rawBlocks.length === 0) {
    return [{ type: 'lead', content: '这篇帖子暂时没有正文内容。' }] satisfies ArticleBlock[]
  }

  return rawBlocks.map((block, index) => {
    if (isCodeBlock(block)) {
      return {
        type: 'code',
        content: stripCodeFence(block),
      } satisfies ArticleBlock
    }

    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
    const noteItems = lines
      .filter((line) => /^(\d+\.|-|\*)\s+/.test(line))
      .map((line) => line.replace(/^(\d+\.|-|\*)\s+/, ''))

    if (noteItems.length >= 2) {
      const introLines = lines.filter((line) => !/^(\d+\.|-|\*)\s+/.test(line))

      return {
        type: 'note',
        title: introLines[0] || '关键信息',
        content: introLines.slice(1).join(' '),
        items: noteItems,
      } satisfies ArticleBlock
    }

    return {
      type: index === 0 ? 'lead' : 'paragraph',
      content: block,
    } satisfies ArticleBlock
  })
}

function mapPostDetailItem(
  sourcePost: PostDetailSource,
  detail: PostDetailData,
  userMap: Record<string, UserInfoDTO>,
  comments: CommentViewData[],
) {
  const likeCount = detail.likeCount ?? detail.like_count ?? 0
  const viewCount = detail.viewCount ?? detail.view_count ?? 0
  const collectCount = detail.collectCount ?? detail.collect_count ?? 0
  const author = getUserInfo(
    userMap,
    detail.uid,
    detail.nickname || sourcePost.author || `用户 ${detail.uid}`,
    detail.avatar || sourcePost.avatar,
  )

  return {
    id: sourcePost.id,
    title: detail.title || sourcePost.title,
    excerpt: sourcePost.excerpt || '这篇帖子还没有摘要。',
    content: detail.content || '这篇帖子暂时没有正文内容。',
    author,
    stats: {
      likes: likeCount,
      comments: resolveCommentCountValue(sourcePost.stats.comments, comments),
      views: viewCount,
      favorites: collectCount,
      isLiked: Boolean(detail.isLiked ?? detail.is_liked),
    },
  } satisfies PostDetailViewData
}

/**
 * @description 渲染帖子详情页，并在详情接口之外补拉评论和用户信息。
 * @param props PostDetailPageProps，详情页初始化数据和交互回调。
 * @returns React 帖子详情页组件。
 */
export function PostDetailPage({
  sourcePost,
  topicLabel,
  accessToken = null,
  currentProfile = null,
  onBack,
  onPostMutated,
  onRequireAuth,
  onToast,
}: PostDetailPageProps) {
  const [loading, setLoading] = useState(true)
  const [detailError, setDetailError] = useState('')
  const [commentError, setCommentError] = useState('')
  const [draftComment, setDraftComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [postLikePending, setPostLikePending] = useState(false)
  const [pendingCommentLikes, setPendingCommentLikes] = useState<number[]>([])
  const [replyTarget, setReplyTarget] = useState<{ parentId: number; replyUid: number; label: string } | null>(null)
  const [pageData, setPageData] = useState<PostDetailPageData | null>(null)
  const titleId = useId()

  function ensureAuth(actionLabel: string) {
    if (accessToken && currentProfile) {
      return true
    }

    onToast({ type: 'error', message: `请先登录后再${actionLabel}` })
    onRequireAuth()
    return false
  }

  function handlePostLike() {
    if (!pageData || postLikePending) {
      return
    }

    if (!ensureAuth('点赞')) {
      return
    }

    const previousLiked = pageData.post.stats.isLiked
    const nextLiked = !previousLiked
    const nextLikes = Math.max(0, pageData.post.stats.likes + (nextLiked ? 1 : -1))

    setPostLikePending(true)
    setPageData((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        post: {
          ...current.post,
          stats: {
            ...current.post.stats,
            likes: nextLikes,
            isLiked: nextLiked,
          },
        },
      }
    })

    toggleLike(
      {
        targetId: sourcePost.id,
        targetType: 1,
      },
      accessToken!,
    )
      .then(() => {
        onPostMutated()
      })
      .catch((error) => {
        setPageData((current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            post: {
              ...current.post,
              stats: {
                ...current.post.stats,
                likes: pageData.post.stats.likes,
                isLiked: previousLiked,
              },
            },
          }
        })
        onToast({ type: 'error', message: error instanceof Error ? error.message : '点赞失败' })
      })
      .finally(() => {
        setPostLikePending(false)
      })
  }

  function toggleCommentLikedState(commentId: number) {
    setPageData((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        comments: current.comments.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, isLiked: !comment.isLiked }
          }

          return {
            ...comment,
            replies: comment.replies.map((reply) => (
              reply.id === commentId
                ? { ...reply, isLiked: !reply.isLiked }
                : reply
            )),
          }
        }),
      }
    })
  }

  function handleCommentLike(commentId: number) {
    if (pendingCommentLikes.includes(commentId)) {
      return
    }

    if (!ensureAuth('点赞')) {
      return
    }

    toggleCommentLikedState(commentId)
    setPendingCommentLikes((current) => [...current, commentId])

    toggleLike(
      {
        targetId: commentId,
        targetType: 2,
      },
      accessToken!,
    )
      .catch((error) => {
        toggleCommentLikedState(commentId)
        onToast({ type: 'error', message: error instanceof Error ? error.message : '评论点赞失败' })
      })
      .finally(() => {
        setPendingCommentLikes((current) => current.filter((item) => item !== commentId))
      })
  }

  function handleReply(parentId: number, replyUid: number, replyName: string) {
    if (!ensureAuth('评论')) {
      return
    }

    setReplyTarget({
      parentId,
      replyUid,
      label: `回复 ${replyName}`,
    })
  }

  async function handleSubmitComment() {
    const content = draftComment.trim()
    if (!content || submittingComment) {
      return
    }

    if (!ensureAuth('评论')) {
      return
    }

    setSubmittingComment(true)

    try {
      await createComment(
        {
          postId: sourcePost.id,
          content,
          ...(replyTarget?.parentId ? { parentId: replyTarget.parentId } : {}),
          ...(replyTarget?.replyUid ? { replyUid: replyTarget.replyUid } : {}),
        },
        accessToken!,
      )

      const createdAt = formatRelativeTime(Math.floor(Date.now() / 1000))
      const localCommentId = Date.now()

      setPageData((current) => {
        if (!current || !currentProfile) {
          return current
        }

        const nextStats = {
          ...current.post.stats,
          comments: current.post.stats.comments + 1,
        }

        if (!replyTarget) {
          return {
            ...current,
            post: {
              ...current.post,
              stats: nextStats,
            },
            comments: [
              {
                id: localCommentId,
                author: {
                  uid: currentProfile.uid,
                  name: currentProfile.nickname,
                  avatar: currentProfile.avatar,
                },
                time: createdAt,
                content,
                replyCount: 0,
                isLiked: false,
                replies: [],
              },
              ...current.comments,
            ],
          }
        }

        return {
          ...current,
          post: {
            ...current.post,
            stats: nextStats,
          },
          comments: current.comments.map((comment) => (
            comment.id === replyTarget.parentId
              ? {
                  ...comment,
                  replyCount: comment.replyCount + 1,
                  replies: [
                    ...comment.replies,
                    {
                      id: localCommentId,
                      author: {
                        uid: currentProfile.uid,
                        name: currentProfile.nickname,
                        avatar: currentProfile.avatar,
                      },
                      replyToName: replyTarget.label.replace(/^回复\s+/, ''),
                      time: createdAt,
                      content,
                      isLiked: false,
                    },
                  ],
                }
              : comment
          )),
        }
      })

      setDraftComment('')
      setReplyTarget(null)
      onPostMutated()
      onToast({ type: 'success', message: '评论已发送' })
    } catch (error) {
      onToast({ type: 'error', message: error instanceof Error ? error.message : '评论发送失败' })
    } finally {
      setSubmittingComment(false)
    }
  }

  useEffect(() => {
    let canceled = false

    async function loadDetailPage() {
      setLoading(true)
      setDetailError('')
      setCommentError('')
      setPageData(null)

      try {
        let nextCommentError = ''
        const [detail, commentData] = await Promise.all([
          fetchPostDetail({ postId: sourcePost.id }),
          fetchPostComment({
            postId: sourcePost.id,
            cursor: 0,
            pageSize: commentPageSize,
          }).catch((error) => {
            nextCommentError = error instanceof Error ? error.message : '评论加载失败'
            appLogger.log({
              level: 'warn',
              category: 'post',
              action: 'comment_failed',
              message: '帖子评论加载失败，页面继续回退到无评论状态',
              context: { postId: sourcePost.id, error },
            })
            return null
          }),
        ])

        const parentComments = normalizeParentComments(commentData)
        const userIds = collectUserIds(detail, parentComments)
        let userMap: Record<string, UserInfoDTO> = {}

        if (userIds.length > 0) {
          try {
            const userInfoResp = await fetchBatchUserInfo({ uids: userIds })
            userMap = userInfoResp.users ?? {}
          } catch (error) {
            appLogger.log({
              level: 'warn',
              category: 'post',
              action: 'detail_user_info_failed',
              message: '帖子详情页补充用户信息失败，回退到接口原始昵称和头像',
              context: { postId: sourcePost.id, uids: userIds, error },
            })
          }
        }

        if (canceled) {
          return
        }

        const mappedComments = mapComments(commentData, userMap)
        const mappedPost = mapPostDetailItem(sourcePost, detail, userMap, mappedComments)

        startTransition(() => {
          const articleBlocks = buildArticleBlocks(mappedPost.content)

          setCommentError(nextCommentError)
          setPageData({
            post: mappedPost,
            articleBlocks,
            comments: mappedComments,
            commentsHasMore: Boolean(commentData?.hasMore ?? commentData?.has_more),
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

    loadDetailPage()

    return () => {
      canceled = true
    }
  }, [onToast, sourcePost, topicLabel])

  return (
    <div className="detail-page">
      <div className="detail-shell">
        <header className="composer-topbar detail-topbar">
          <button className="forum-nav-link" onClick={onBack} type="button">
            返回列表
          </button>
        </header>

        <main className="detail-frame">
          {loading ? (
            <div className="forum-state-panel detail-panel" role="status" aria-live="polite">
              正在加载帖子详情和评论…
            </div>
          ) : null}

          {!loading && detailError ? (
            <section className="detail-panel">
              <div className="forum-state-panel forum-state-panel--error">
                <p>{detailError}</p>
                {detailError.includes('token is null') ? (
                  <p className="detail-hint">请先登录后再查看帖子详情。</p>
                ) : null}
                <button className="forum-pill-button forum-pill-button--ghost" onClick={onBack} type="button">
                  返回帖子页
                </button>
              </div>
            </section>
          ) : null}

          {!loading && !detailError && pageData ? (
            <div className="detail-grid">
              <div className="detail-main">
                <section className="detail-panel detail-panel--header">
                  <div className="detail-panel__eyebrow">
                    <span className={`forum-topic-badge forum-topic-badge--${sourcePost.topic ?? 'tech'}`}>{topicLabel}</span>
                    <span className="detail-panel__time">发布于 {sourcePost.time}</span>
                  </div>

                  <h1 id={titleId}>{pageData.post.title}</h1>
                </section>

                <section className="detail-panel detail-panel--article" aria-labelledby={titleId}>
                  {pageData.articleBlocks.map((block, index) => {
                    if (block.type === 'note') {
                      return (
                        <section className="detail-note-block" key={`${pageData.post.id}-note-${index}`}>
                          <strong>{block.title}</strong>
                          {block.content ? <p>{block.content}</p> : null}
                          {block.items?.length ? (
                            <ul>
                              {block.items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          ) : null}
                        </section>
                      )
                    }

                    if (block.type === 'code') {
                      return (
                        <pre className="detail-code-block" key={`${pageData.post.id}-code-${index}`}>
                          <code>{block.content}</code>
                        </pre>
                      )
                    }

                    return (
                      <p
                        className={block.type === 'lead' ? 'detail-copy detail-copy--lead' : 'detail-copy'}
                        key={`${pageData.post.id}-copy-${index}`}
                      >
                        {block.content}
                      </p>
                    )
                  })}

                  <div className="detail-panel__footer detail-panel__footer--article">
                    <div className="detail-inline-author">
                      <span
                        className="detail-inline-author__avatar"
                        style={buildAvatarStyle(pageData.post.author.avatar, pageData.post.author.uid)}
                      />
                      <div className="detail-inline-author__body">
                        <strong>{pageData.post.author.name}</strong>
                        <span>UID {pageData.post.author.uid} · {topicLabel}</span>
                      </div>
                    </div>

                    <div className="detail-stat-strip" aria-label="帖子统计信息">
                      <button
                        className={`detail-stat-chip detail-stat-chip--interactive${pageData.post.stats.isLiked ? ' detail-stat-chip--active' : ''}`}
                        disabled={postLikePending}
                        onClick={handlePostLike}
                        type="button"
                      >
                        <StatIcon type="like" />
                        <span>{formatCount(pageData.post.stats.likes)} {pageData.post.stats.isLiked ? '已赞' : '点赞'}</span>
                      </button>
                      <div className="detail-stat-chip">
                        <StatIcon type="comment" />
                        <span>{formatCount(pageData.post.stats.comments)} 评论</span>
                      </div>
                      <div className="detail-stat-chip">
                        <StatIcon type="view" />
                        <span>{formatCount(pageData.post.stats.views)} 浏览</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="detail-panel detail-panel--comments">
                  <div className="detail-section-head">
                    <div>
                      <h2>评论 {formatCount(pageData.post.stats.comments)}</h2>
                      <p>{commentError ? '评论加载失败，请稍后重试。' : '按热度排序展示评论。'}</p>
                    </div>
                    <span className="detail-section-tag">
                      {pageData.commentsHasMore ? '还有更多' : '已加载完成'}
                    </span>
                  </div>

                  {commentError ? <p className="detail-inline-hint">{commentError}</p> : null}

                  {pageData.comments.length > 0 ? (
                    <div className="detail-comment-list">
                      {pageData.comments.map((comment) => (
                        <article className="detail-comment-card" key={comment.id}>
                          <div className="detail-comment-card__meta">
                            <div className="detail-comment-author">
                              <span
                                className="detail-comment-author__avatar"
                                style={buildAvatarStyle(comment.author.avatar, comment.author.uid)}
                              />
                              <div className="detail-comment-author__body">
                                <strong>{comment.author.name}</strong>
                                <span>{comment.time}</span>
                              </div>
                            </div>
                            <span className="detail-comment-card__tag">{comment.replyCount} 条回复</span>
                          </div>

                          <p className="detail-comment-card__content">{comment.content}</p>

                          <div className="detail-comment-card__actions">
                            <button
                              className={`detail-comment-action${comment.isLiked ? ' detail-comment-action--active' : ''}`}
                              disabled={pendingCommentLikes.includes(comment.id)}
                              onClick={() => handleCommentLike(comment.id)}
                              type="button"
                            >
                              <StatIcon type="like" />
                              <span>{comment.isLiked ? '已赞' : '点赞'}</span>
                            </button>
                            <button
                              className="detail-comment-action"
                              onClick={() => handleReply(comment.id, comment.author.uid, comment.author.name)}
                              type="button"
                            >
                              <StatIcon type="comment" />
                              <span>回复</span>
                            </button>
                          </div>

                          {comment.replies.length > 0 ? (
                            <div className="detail-comment-replies">
                              {comment.replies.map((reply) => (
                                <div className="detail-comment-reply" key={reply.id}>
                                  <div className="detail-comment-reply__meta">
                                    <span
                                      className="detail-comment-reply__avatar"
                                      style={buildAvatarStyle(reply.author.avatar, reply.author.uid)}
                                    />
                                    <div>
                                      <strong>{reply.author.name}</strong>
                                      <span>{reply.time}</span>
                                    </div>
                                  </div>

                                  <p>
                                    {reply.replyToName ? <span>@{reply.replyToName} </span> : null}
                                    {reply.content}
                                  </p>

                                  <div className="detail-comment-card__actions detail-comment-card__actions--reply">
                                    <button
                                      className={`detail-comment-action detail-comment-action--small${reply.isLiked ? ' detail-comment-action--active' : ''}`}
                                      disabled={pendingCommentLikes.includes(reply.id)}
                                      onClick={() => handleCommentLike(reply.id)}
                                      type="button"
                                    >
                                      <StatIcon type="like" />
                                      <span>{reply.isLiked ? '已赞' : '点赞'}</span>
                                    </button>
                                    <button
                                      className="detail-comment-action detail-comment-action--small"
                                      onClick={() => handleReply(comment.id, reply.author.uid, reply.author.name)}
                                      type="button"
                                    >
                                      <StatIcon type="comment" />
                                      <span>回复</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="detail-empty-comments">
                      <p>还没有评论，欢迎在后续版本里把首条回复补上来。</p>
                    </div>
                  )}

                  <div className="detail-reply-box">
                    <div className="detail-reply-box__meta">
                      <span
                        className="detail-reply-box__avatar"
                        style={buildAvatarStyle(currentProfile?.avatar || '', currentProfile?.uid || 0)}
                      />
                      <div>
                        <strong>{currentProfile?.nickname || '游客用户'}</strong>
                        <span>{currentProfile ? '分享你的想法…' : '登录后可参与评论和点赞。'}</span>
                      </div>
                    </div>

                    {replyTarget ? (
                      <div className="detail-reply-box__replying">
                        <span>{replyTarget.label}</span>
                        <button className="detail-comment-action detail-comment-action--small" onClick={() => setReplyTarget(null)} type="button">
                          取消
                        </button>
                      </div>
                    ) : null}

                    <textarea
                      className="detail-reply-box__field detail-reply-box__field--textarea"
                      onChange={(event) => setDraftComment(event.target.value)}
                      placeholder={currentProfile ? '写下你的回复…' : '登录后可发表评论'}
                      value={draftComment}
                    />

                    <div className="detail-reply-box__footer">
                      <span>{replyTarget ? '本次会按回复模式提交到后端。' : '直接发布为当前帖子的一级评论。'}</span>
                      <button
                        className="forum-pill-button"
                        disabled={submittingComment || !draftComment.trim()}
                        onClick={handleSubmitComment}
                        type="button"
                      >
                        {submittingComment ? '发送中…' : '发送评论'}
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
