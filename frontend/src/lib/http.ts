import { appEnv } from '../config/env'
import type { ApiResponse } from '../types/api'

const defaultBaseCandidates = ['/account', '/api/v1/account']

function buildBaseCandidates() {
  const seen = new Set<string>()
  const values = [appEnv.apiBasePath, ...defaultBaseCandidates]

  return values.filter((value) => {
    if (!value || seen.has(value)) {
      return false
    }

    seen.add(value)
    return true
  })
}

export async function postJson<TResponse, TPayload>(
  path: string,
  payload: TPayload,
) {
  let lastError: Error | null = null

  for (const basePath of buildBaseCandidates()) {
    try {
      const response = await fetch(`${basePath}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (response.status === 404) {
        continue
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = (await response.json()) as ApiResponse<TResponse>

      if (result.code !== 0) {
        throw new Error(result.msg || '请求失败')
      }

      return result.data as TResponse
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error('网络请求失败，请稍后再试')
    }
  }

  throw lastError ?? new Error('接口不可用，请检查网关服务是否已启动')
}

