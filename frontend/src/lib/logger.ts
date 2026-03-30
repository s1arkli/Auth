/** 负责统一浏览器端日志输出，并在生产环境脱敏敏感字段。 */
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

/**
 * @description 对敏感字符串做首尾保留的脱敏展示，避免日志完全失去排查价值。
 * @param value string，待脱敏的敏感原文。
 * @returns string，适合打印到日志中的安全字符串。
 */
function maskSecret(value: string) {
  if (value.length <= 8) {
    return '[REDACTED]'
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

/**
 * @description 递归清洗日志上下文，避免生产环境泄露密码、Token（令牌）等敏感信息。
 * @param value unknown，待清洗的任意上下文数据。
 * @param depth number，当前递归深度，用于防止超深对象刷爆日志。
 * @returns unknown，可安全输出到日志里的对象或基础值。
 */
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
  /**
   * @description 按统一格式输出前端业务日志，并根据环境决定是否执行上下文脱敏。
   * @param payload LogPayload，日志级别、分类、动作和上下文信息。
   * @returns void
   */
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

    // 开发环境保留原始上下文方便联调，生产环境统一走脱敏逻辑。
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

/**
 * @description 监听浏览器全局错误并桥接到统一日志系统，方便排查线上未捕获异常。
 * @returns void
 */
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
