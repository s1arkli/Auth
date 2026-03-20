import { useEffect, useMemo, useState } from 'react'
import { login, register } from './api/auth'
import { appEnv } from './config/env'
import { Toast, type ToastState } from './components/Toast'
import type { AuthSuccessState } from './types/api'

type AuthMode = 'login' | 'register'

interface CopyContent {
  eyebrow: string
  title: string
  description: string
  cards: Array<{ title: string; text: string }>
  formTitle: string
  formSubtitle: string
  hint: string
  button: string
  footPrefix: string
  footAction: string
}

const contentMap: Record<AuthMode, CopyContent> = {
  login: {
    eyebrow: 'MONO ACCOUNT',
    title: '先登录，再进入你的工作空间。',
    description:
      '面向当前 mono 项目的受保护访问场景。用户触发业务逻辑后，如果未登录，会先进入这里完成身份验证，再返回原页面继续操作。',
    cards: [
      {
        title: '统一入口',
        text: '前端统一从网关发起调用，减少后续页面切换时的认证分散问题。',
      },
      {
        title: '会话准备',
        text: '联调成功后先弹出提示，不直接跳转，方便后续继续补页面和权限流转。',
      },
    ],
    formTitle: '欢迎回来',
    formSubtitle: '使用你的 mono 账号登录',
    hint: '登录成功后会先给出成功提示，页面跳转在后续业务开发阶段再接入。',
    button: '登录',
    footPrefix: '还没有账号？',
    footAction: '立即注册',
  },
  register: {
    eyebrow: 'CREATE YOUR ACCESS',
    title: '创建账号，进入 mono 的受保护体验。',
    description:
      '当前项目已经具备注册、登录能力，所以注册页可以直接作为正式入口页的一部分来设计。风格上保持轻、白、透、稳。',
    cards: [
      {
        title: '快速开通',
        text: '保留最小字段，先打通账号创建链路，让后端注册接口先稳定可用。',
      },
      {
        title: '后续演进',
        text: '后面再逐步补手机号、验证码、找回密码和受保护页面跳转，不影响当前交付。',
      },
    ],
    formTitle: '创建你的账号',
    formSubtitle: '仅需几步，即可进入登录后的工作页面',
    hint: '注册成功后只弹提示，不立即跳转，便于后续按真实业务再接页面流转。',
    button: '创建账号',
    footPrefix: '已经有账号？',
    footAction: '去登录',
  },
}

function validate(mode: AuthMode, account: string, password: string) {
  const cleanedAccount = account.trim()
  const cleanedPassword = password.trim()

  if (!cleanedAccount) {
    return '请输入账号'
  }

  if (!cleanedPassword) {
    return '请输入密码'
  }

  if (mode === 'register' && cleanedPassword.length < 8) {
    return '注册密码至少需要 8 位字符'
  }

  return ''
}

export default function App() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [successState, setSuccessState] = useState<AuthSuccessState | null>(null)

  const copy = useMemo(() => contentMap[mode], [mode])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const message = validate(mode, account, password)
    if (message) {
      setToast({ type: 'error', message })
      return
    }

    if (mode === 'register' && !agree) {
      setToast({ type: 'error', message: '请先确认服务条款与隐私说明' })
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'login') {
        const data = await login({
          account: account.trim(),
          password,
        })

        setSuccessState({
          account: account.trim(),
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        })
        setToast({ type: 'success', message: '登录成功，接口联调已通过。' })
      } else {
        await register({
          account: account.trim(),
          password,
        })

        setSuccessState({
          account: account.trim(),
          accessToken: '',
        })
        setToast({ type: 'success', message: '注册成功，当前先保留在本页提示。' })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '请求失败，请稍后再试'
      setToast({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode)
    setToast(null)
    setSuccessState(null)
  }

  return (
    <div className={`app app--${mode}`}>
      <Toast toast={toast} />
      <header className="topbar">
        <div>
          <div className="brand">mono</div>
          <p className="topbar__hint">
            {mode === 'login' ? '登录后进入受保护页面' : '新用户注册'}
          </p>
        </div>
        <div className="mode-switch" aria-label="认证模式切换">
          <button
            className={mode === 'login' ? 'mode-switch__item is-active' : 'mode-switch__item'}
            onClick={() => handleModeChange('login')}
            type="button"
          >
            登录
          </button>
          <button
            className={mode === 'register' ? 'mode-switch__item is-active' : 'mode-switch__item'}
            onClick={() => handleModeChange('register')}
            type="button"
          >
            注册
          </button>
        </div>
      </header>

      <main className="hero">
        <section className="hero__intro">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="hero__description">{copy.description}</p>
          <div className="feature-list">
            {copy.cards.map((item) => (
              <article className="feature-card" key={item.title}>
                <div className="feature-card__index" />
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="hero__panel">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-card__heading">
              <h2>{copy.formTitle}</h2>
              <p>{copy.formSubtitle}</p>
            </div>

            <label className="field">
              <span className="field__label">账号</span>
              <input
                autoComplete="username"
                className="field__control"
                name="account"
                onChange={(event) => setAccount(event.target.value)}
                placeholder={mode === 'login' ? '请输入 account' : '设置你的 account'}
                value={account}
              />
            </label>

            <label className="field">
              <span className="field__label">密码</span>
              <input
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="field__control"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === 'login' ? '请输入密码' : '至少 8 位字符'}
                type="password"
                value={password}
              />
            </label>

            {mode === 'login' ? (
              <div className="meta-row">
                <span>忘记密码？</span>
                <span className="meta-row__link">需要帮助</span>
              </div>
            ) : (
              <label className="agreement">
                <input
                  checked={agree}
                  onChange={(event) => setAgree(event.target.checked)}
                  type="checkbox"
                />
                <span>我已阅读并同意服务条款与隐私说明</span>
              </label>
            )}

            <button className="submit-button" disabled={submitting} type="submit">
              {submitting ? '提交中...' : copy.button}
            </button>

            <div className="foot-switch">
              <span>{copy.footPrefix}</span>
              <button
                className="foot-switch__action"
                onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
                type="button"
              >
                {copy.footAction}
              </button>
            </div>

            <div className="auth-tip">
              <p>{copy.hint}</p>
            </div>
          </form>

          <aside className="debug-card">
            <p className="debug-card__label">联调状态</p>
            {successState ? (
              <>
                <h3>最近一次成功调用</h3>
                <dl className="debug-list">
                  <div>
                    <dt>账号</dt>
                    <dd>{successState.account}</dd>
                  </div>
                  <div>
                    <dt>Access Token</dt>
                    <dd>
                      {successState.accessToken
                        ? `${successState.accessToken.slice(0, 30)}...`
                        : '注册接口返回成功'}
                    </dd>
                  </div>
                  {successState.refreshToken ? (
                    <div>
                      <dt>Refresh Token</dt>
                      <dd>{`${successState.refreshToken.slice(0, 30)}...`}</dd>
                    </div>
                  ) : null}
                </dl>
              </>
            ) : (
              <>
                <h3>等待后端返回</h3>
                <p>
                  当前会依次尝试 <code>{appEnv.apiBasePath}</code>、<code>/account</code>、
                  <code>/api/v1/account</code> 三组前缀，兼容你现在网关路由和文档定义不完全一致的情况。
                </p>
              </>
            )}
          </aside>
        </section>
      </main>
    </div>
  )
}

