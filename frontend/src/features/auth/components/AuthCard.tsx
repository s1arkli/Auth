import type { FormEvent, RefObject } from 'react'
import type { AuthCopyContent, AuthMode } from '@/features/auth/types/auth.types'

interface AuthCardProps {
  mode: AuthMode
  transitionStage: 'idle' | 'leaving' | 'entering'
  copy: AuthCopyContent
  account: string
  password: string
  agree: boolean
  authError: string
  authStatusId: string
  submitting: boolean
  accountInputRef: RefObject<HTMLInputElement | null>
  passwordInputRef: RefObject<HTMLInputElement | null>
  agreementInputRef: RefObject<HTMLInputElement | null>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onModeChange: (nextMode: AuthMode) => void
  onAccountChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onAgreeChange: (checked: boolean) => void
  onOpenHome: () => void
}

export function AuthCard({
  mode,
  transitionStage,
  copy,
  account,
  password,
  agree,
  authError,
  authStatusId,
  submitting,
  accountInputRef,
  passwordInputRef,
  agreementInputRef,
  onSubmit,
  onModeChange,
  onAccountChange,
  onPasswordChange,
  onAgreeChange,
  onOpenHome,
}: AuthCardProps) {
  return (
    <div className={`app app--${mode}`}>
      <header className="topbar">
        <button className="brand brand--home" onClick={onOpenHome} type="button">
          mono
        </button>
        <div className="mode-switch" aria-label="认证模式切换">
          <button
            className={mode === 'login' ? 'mode-switch__item is-active' : 'mode-switch__item'}
            onClick={() => onModeChange('login')}
            type="button"
          >
            登录
          </button>
          <button
            className={mode === 'register' ? 'mode-switch__item is-active' : 'mode-switch__item'}
            onClick={() => onModeChange('register')}
            type="button"
          >
            注册
          </button>
        </div>
      </header>

      <main className="hero">
        <section className={`hero__intro auth-stage auth-stage--${transitionStage}`}>
          <h1>{copy.heroTitle}</h1>
          <div className="hero__logo" aria-label="mono brand logo">
            <span className="hero__logoMark" />
            <span className="hero__logoText">mono</span>
          </div>
        </section>

        <section className={`hero__panel auth-stage auth-stage--${transitionStage}`}>
          <form className="auth-card" onSubmit={onSubmit}>
            <div className="auth-card__heading">
              <h2>{copy.formTitle}</h2>
              <p>{copy.formSubtitle}</p>
            </div>

            {authError ? (
              <p className="auth-card__status auth-card__status--error" id={authStatusId} role="alert">
                {authError}
              </p>
            ) : null}

            <label className="field">
              <span className="field__label">账号</span>
              <input
                autoComplete="username"
                className="field__control"
                inputMode="text"
                name="account"
                onChange={(event) => onAccountChange(event.target.value)}
                placeholder={mode === 'login' ? '请输入 account…' : '设置你的 account…'}
                ref={accountInputRef}
                spellCheck={false}
                type="text"
                value={account}
              />
            </label>

            <label className="field">
              <span className="field__label">密码</span>
              <input
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                aria-describedby={authError ? authStatusId : undefined}
                className="field__control"
                minLength={mode === 'register' ? 8 : undefined}
                name="password"
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder={mode === 'login' ? '请输入密码…' : '至少 8 位字符…'}
                ref={passwordInputRef}
                type="password"
                value={password}
              />
            </label>

            {mode === 'login' ? (
              <div className="meta-row">
                <span>登录成功后会进入真实帖子页</span>
                <span className="meta-row__link">当前不在页面层读取 refresh token</span>
              </div>
            ) : (
              <label className="agreement">
                <input
                  checked={agree}
                  onChange={(event) => onAgreeChange(event.target.checked)}
                  ref={agreementInputRef}
                  type="checkbox"
                />
                <span>我已阅读并同意服务条款与隐私说明</span>
              </label>
            )}

            <button className="submit-button" disabled={submitting} type="submit">
              {submitting ? '提交中…' : copy.button}
            </button>

            <div className="foot-switch">
              <span>{copy.footPrefix}</span>
              <button
                className="foot-switch__action"
                onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
                type="button"
              >
                {copy.footAction}
              </button>
            </div>

            <div className="auth-tip">
              <p>{copy.hint}</p>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
