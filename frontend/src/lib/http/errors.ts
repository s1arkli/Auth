export const SERVICE_UNAVAILABLE_MESSAGE = '服务器正在开小差，请稍后再试。'

export class HttpRequestError extends Error {
  kind: 'service_unavailable' | 'request'
  status: number | undefined

  constructor(message: string, options: { kind: 'service_unavailable' | 'request'; status?: number }) {
    super(message)
    this.name = 'HttpRequestError'
    this.kind = options.kind
    this.status = options.status
  }
}

export function isServiceUnavailableError(error: unknown): error is HttpRequestError {
  return error instanceof HttpRequestError && error.kind === 'service_unavailable'
}
