import { useId, useRef, useState, type FormEvent } from 'react'
import type { ToastState } from '@/components/Toast'
import { createPost } from '@/features/post'
import { appLogger } from '@/lib/logger'

type ComposerTopic = 'tech' | 'life' | 'chat'

interface ComposerTopicOption {
  key: ComposerTopic
  label: string
  description: string
}

interface PostComposerPageProps {
  accessToken: string | null
  topicOptions: ComposerTopicOption[]
  onBack: () => void
  onCreated: () => void
  onRequireAuth: () => void
  onToast: (toast: ToastState) => void
  getPostTypeByTopic: (topic: ComposerTopic) => number
}

export function PostComposerPage({
  accessToken,
  topicOptions,
  onBack,
  onCreated,
  onRequireAuth,
  onToast,
  getPostTypeByTopic,
}: PostComposerPageProps) {
  const [draftTitle, setDraftTitle] = useState('')
  const [draftContent, setDraftContent] = useState('')
  const [draftTopic, setDraftTopic] = useState<ComposerTopic>('tech')
  const [composerError, setComposerError] = useState('')
  const [creating, setCreating] = useState(false)
  const titleId = useId()
  const contentId = useId()
  const statusId = useId()
  const draftTitleRef = useRef<HTMLInputElement | null>(null)
  const draftContentRef = useRef<HTMLTextAreaElement | null>(null)

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!accessToken) {
      appLogger.log({
        level: 'warn',
        category: 'post',
        action: 'create_requires_login',
        message: '当前未登录，发帖前需要先完成登录',
      })
      onToast({ type: 'error', message: '当前没有登录态，请先登录后再发帖。' })
      onRequireAuth()
      return
    }

    if (!draftTitle.trim()) {
      setComposerError('请输入帖子标题')
      draftTitleRef.current?.focus()
      onToast({ type: 'error', message: '请输入帖子标题。' })
      return
    }

    if (!draftContent.trim()) {
      setComposerError('请输入帖子内容')
      draftContentRef.current?.focus()
      onToast({ type: 'error', message: '请输入帖子内容。' })
      return
    }

    setComposerError('')
    setCreating(true)

    try {
      await createPost(
        {
          title: draftTitle.trim(),
          content: draftContent.trim(),
          post_type: getPostTypeByTopic(draftTopic),
        },
        accessToken,
      )

      onToast({ type: 'success', message: '发帖成功，已返回帖子页。' })
      onCreated()
    } catch (error) {
      appLogger.log({
        level: 'error',
        category: 'post',
        action: 'create_failed',
        message: '发帖失败',
        context: error,
      })
      onToast({
        type: 'error',
        message: error instanceof Error ? error.message : '发帖失败，请稍后再试',
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="composer-page">
      <div className="composer-shell">
        <header className="composer-topbar">
          <button className="forum-nav-link" onClick={onBack} type="button">
            返回帖子页
          </button>
          <div className="forum-brand" aria-label="mono forum composer">
            <span className="forum-brand__dot" />
            <span className="forum-brand__text">mono</span>
          </div>
        </header>

        <main className="composer-layout">
          <form className="composer-card" onSubmit={handleCreatePost}>
            <div className="composer-card__heading">
              <h2>发布新帖</h2>
              <p>标题、分类、正文都在这里一次完成。</p>
            </div>

            {composerError ? (
              <p className="forum-form-error" id={statusId} role="alert">
                {composerError}
              </p>
            ) : null}

            <label className="composer-field" htmlFor={titleId}>
              <span className="composer-field__label">标题</span>
              <input
                className="composer-field__input"
                disabled={creating}
                id={titleId}
                maxLength={100}
                onChange={(event) => {
                  setDraftTitle(event.target.value)
                  if (composerError) {
                    setComposerError('')
                  }
                }}
                placeholder="输入一个明确、简洁的标题…"
                ref={draftTitleRef}
                value={draftTitle}
              />
            </label>

            <div className="composer-topic-group" role="radiogroup" aria-label="帖子分类">
              <span className="composer-field__label">分类</span>
              <div className="composer-topic-grid">
                {topicOptions.map((item) => {
                  const active = item.key === draftTopic
                  return (
                    <button
                      aria-checked={active}
                      className={active ? 'composer-topic-card is-active' : 'composer-topic-card'}
                      key={item.key}
                      onClick={() => {
                        setDraftTopic(item.key)
                        if (composerError) {
                          setComposerError('')
                        }
                      }}
                      role="radio"
                      type="button"
                    >
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="composer-field" htmlFor={contentId}>
              <span className="composer-field__label">正文</span>
              <textarea
                aria-describedby={composerError ? statusId : undefined}
                className="composer-field__textarea"
                disabled={creating}
                id={contentId}
                maxLength={1000}
                onChange={(event) => {
                  setDraftContent(event.target.value)
                  if (composerError) {
                    setComposerError('')
                  }
                }}
                placeholder="写下你的观点、上下文、结论或者问题…"
                ref={draftContentRef}
                value={draftContent}
              />
            </label>

            <div className="composer-card__actions">
              <span>{draftContent.trim().length}/1000</span>
              <div className="composer-card__actionRow">
                <button className="forum-pill-button forum-pill-button--ghost" onClick={onBack} type="button">
                  取消
                </button>
                <button className="forum-pill-button" disabled={creating} type="submit">
                  {creating ? '发布中…' : '确认发布'}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
