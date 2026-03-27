import { useEffect } from 'react'
import { appEnv } from '../config/env'

export type LogLevel = 'info' | 'success' | 'warn' | 'error'
export type LogCategory = 'request' | 'auth' | 'post' | 'ui' | 'system'

interface LogPayload {
  level: LogLevel
  category: LogCategory
  action: string
  message: string
  context?: unknown
  status?: number
  durationMs?: number
}

const sensitiveKeyPattern = /(password|token|authorization|cookie|secret|credential)/i

function maskSecret(value: string) {
  if (value.length <= 8) {
    return '[REDACTED]'
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (value == null) {
    return value
  }

  if (depth > 3) {
    return '[TRUNCATED]'
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack?.split('\n').slice(0, 4).join('\n'),
    }
  }

  if (typeof value === 'string') {
    if (value.startsWith('Bearer ')) {
      return `Bearer ${maskSecret(value.slice(7))}`
    }
    return value.length > 400 ? `${value.slice(0, 400)}...` : value
  }

  if (typeof value !== 'object') {
    return value
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1))
  }

  const output: Record<string, unknown> = {}
  const entries = Object.entries(value as Record<string, unknown>).slice(0, 30)
  for (const [key, item] of entries) {
    if (sensitiveKeyPattern.test(key)) {
      output[key] = typeof item === 'string' ? maskSecret(item) : '[REDACTED]'
      continue
    }
    output[key] = sanitizeValue(item, depth + 1)
  }
  return output
}

function getConsoleMethod(level: LogLevel) {
  if (level === 'error') {
    return console.error
  }
  if (level === 'warn') {
    return console.warn
  }
  return console.info
}

export const appLogger = {
  log(payload: LogPayload) {
    const method = getConsoleMethod(payload.level)
    const title = [
      `[mono/${payload.category}]`,
      payload.action,
      payload.message,
      payload.status != null ? `status=${payload.status}` : '',
      payload.durationMs != null ? `${Math.round(payload.durationMs)}ms` : '',
    ]
      .filter(Boolean)
      .join(' ')

    const context = appEnv.dev ? payload.context : sanitizeValue(payload.context)

    if (context === undefined) {
      method(title)
      return
    }

    console.groupCollapsed(title)
    method('context:', context)
    console.groupEnd()
  },
}

export function useBrowserLogBridge() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      appLogger.log({
        level: 'error',
        category: 'system',
        action: 'window_error',
        message: event.message || '捕获到未处理脚本错误',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      })
    }

    function handleRejection(event: PromiseRejectionEvent) {
      appLogger.log({
        level: 'error',
        category: 'system',
        action: 'unhandled_rejection',
        message: '捕获到未处理 Promise 异常',
        context: event.reason,
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])
}
