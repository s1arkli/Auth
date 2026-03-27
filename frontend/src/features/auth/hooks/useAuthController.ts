import { startTransition, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { login, register } from '@/features/auth/api/auth.api'
import { authContentMap } from '@/features/auth/constants/auth.constants'
import type { AuthMode, AuthSuccessState } from '@/features/auth/types/auth.types'
import { persistAuthState, readPersistedAuth } from '@/features/auth/utils/auth.storage'
import { validateAuthForm } from '@/features/auth/utils/auth.validation'
import type { UserProfile } from '@/features/user'
import { isServiceUnavailableError } from '@/lib/http/errors'
import { appLogger } from '@/lib/logger'

interface AuthToast {
  type: 'success' | 'error'
  message: string
}

interface UseAuthControllerOptions {
  onLoginSuccess: () => void
  onToastChange: (toast: AuthToast | null) => void
}

function buildCurrentProfile(authState: AuthSuccessState | null): UserProfile | null {
  if (!authState || typeof authState.uid !== 'number') {
    return null
  }

  return {
    uid: authState.uid,
    nickname: authState.nickname || authState.account,
    avatar: authState.avatar || '',
  }
}

export function useAuthController({ onLoginSuccess, onToastChange }: UseAuthControllerOptions) {
  const [bootAuth] = useState<AuthSuccessState | null>(() => readPersistedAuth())
  const [mode, setMode] = useState<AuthMode>('login')
  const [account, setAccount] = useState(() => bootAuth?.account ?? '')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(true)
  const [authError, setAuthError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(() => bootAuth?.accessToken ?? null)
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(() => buildCurrentProfile(bootAuth))
  const [transitionStage, setTransitionStage] = useState<'idle' | 'leaving' | 'entering'>('idle')
  const switchTimerRef = useRef<number | null>(null)
  const enterTimerRef = useRef<number | null>(null)
  const accountInputRef = useRef<HTMLInputElement | null>(null)
  const passwordInputRef = useRef<HTMLInputElement | null>(null)
  const agreementInputRef = useRef<HTMLInputElement | null>(null)
  const authStatusId = useId()

  const copy = useMemo(() => authContentMap[mode], [mode])

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) {
        window.clearTimeout(switchTimerRef.current)
      }

      if (enterTimerRef.current) {
        window.clearTimeout(enterTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!accessToken || !account.trim()) {
      persistAuthState(null)
      return
    }

    persistAuthState({
      account: account.trim(),
      accessToken,
      ...(currentProfile ? currentProfile : {}),
    })
  }, [accessToken, account, currentProfile])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateAuthForm(mode, account, password)
    if (validation) {
      appLogger.log({
        level: 'warn',
        category: 'auth',
        action: 'auth_validation_failed',
        message: validation.message,
        context: { mode, account: account.trim() },
      })
      setAuthError(validation.message)
      onToastChange({ type: 'error', message: validation.message })

      if (validation.field === 'account') {
        accountInputRef.current?.focus()
      } else if (validation.field === 'password') {
        passwordInputRef.current?.focus()
      }

      return
    }

    if (mode === 'register' && !agree) {
      appLogger.log({
        level: 'warn',
        category: 'auth',
        action: 'register_agreement_required',
        message: '注册被拦截，用户未勾选服务条款',
      })
      setAuthError('请先确认服务条款与隐私说明')
      agreementInputRef.current?.focus()
      onToastChange({ type: 'error', message: '请先确认服务条款与隐私说明' })
      return
    }

    setAuthError('')
    setSubmitting(true)
    appLogger.log({
      level: 'info',
      category: 'auth',
      action: mode === 'login' ? 'login_submit' : 'register_submit',
      message: mode === 'login' ? '提交登录请求' : '提交注册请求',
      context: { account: account.trim() },
    })

    try {
      if (mode === 'login') {
        const authResult = await login({
          account: account.trim(),
          password,
        })

        setAccount(account.trim())
        setAccessToken(authResult.accessToken)
        setCurrentProfile({
          uid: authResult.uid,
          nickname: authResult.nickname || account.trim(),
          avatar: authResult.avatar || '',
        })
        appLogger.log({
          level: 'success',
          category: 'auth',
          action: 'login_success',
          message: '登录成功并已写入 access token',
          context: { account: account.trim() },
        })
        onToastChange({ type: 'success', message: '登录成功，已切到真实帖子列表。' })
        startTransition(() => {
          onLoginSuccess()
        })
      } else {
        await register({
          account: account.trim(),
          password,
        })

        appLogger.log({
          level: 'success',
          category: 'auth',
          action: 'register_success',
          message: '注册成功',
          context: { account: account.trim() },
        })
        onToastChange({ type: 'success', message: '注册成功，现在可以直接登录验证。' })
        setAuthError('')
        setMode('login')
      }
    } catch (error) {
      appLogger.log({
        level: 'error',
        category: 'auth',
        action: mode === 'login' ? 'login_failed' : 'register_failed',
        message: mode === 'login' ? '登录失败' : '注册失败',
        context: error,
      })
      const message = error instanceof Error ? error.message : '请求失败，请稍后再试'
      if (isServiceUnavailableError(error)) {
        setAuthError('')
      } else {
        setAuthError(message)
      }
      onToastChange({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  function handleModeChange(nextMode: AuthMode) {
    if (nextMode === mode || transitionStage === 'leaving') {
      return
    }

    onToastChange(null)
    setAuthError('')
    appLogger.log({
      level: 'info',
      category: 'ui',
      action: 'auth_mode_change',
      message: '切换认证模式',
      context: { from: mode, to: nextMode },
    })
    setTransitionStage('leaving')

    if (switchTimerRef.current) {
      window.clearTimeout(switchTimerRef.current)
    }

    if (enterTimerRef.current) {
      window.clearTimeout(enterTimerRef.current)
    }

    switchTimerRef.current = window.setTimeout(() => {
      setMode(nextMode)
      setTransitionStage('entering')

      enterTimerRef.current = window.setTimeout(() => {
        setTransitionStage('idle')
      }, 260)
    }, 170)
  }

  function handleAccountChange(value: string) {
    setAccount(value)
    if (authError) {
      setAuthError('')
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    if (authError) {
      setAuthError('')
    }
  }

  function handleAgreeChange(checked: boolean) {
    setAgree(checked)
    if (authError) {
      setAuthError('')
    }
  }

  function logout() {
    setAccessToken(null)
    setCurrentProfile(null)
    appLogger.log({
      level: 'info',
      category: 'auth',
      action: 'logout',
      message: '用户主动退出登录',
    })
    onToastChange({ type: 'success', message: '已退出登录。' })
  }

  return {
    accessToken,
    account,
    accountInputRef,
    agree,
    agreementInputRef,
    authError,
    authStatusId,
    bootAuth,
    copy,
    currentProfile,
    handleAccountChange,
    handleAgreeChange,
    handleModeChange,
    handlePasswordChange,
    handleSubmit,
    logout,
    mode,
    password,
    passwordInputRef,
    setCurrentProfile,
    submitting,
    transitionStage,
  }
}
