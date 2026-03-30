/** 负责定义请求层统一错误类型和服务不可用判断逻辑。 */
export const SERVICE_UNAVAILABLE_MESSAGE = '服务器正在开小差，请稍后再试。'

/** 表示请求层可感知的统一异常对象。 */
export class HttpRequestError extends Error {
  kind: 'service_unavailable' | 'request'
  status: number | undefined

  /**
   * @description 构造带错误分类和状态码的请求异常，便于页面层做差异化处理。
   * @param message string，展示给用户或日志系统的错误消息。
   * @param options {{ kind: 'service_unavailable' | 'request'; status?: number }}，错误分类和可选状态码。
   * @returns HttpRequestError
   */
  constructor(message: string, options: { kind: 'service_unavailable' | 'request'; status?: number }) {
    super(message)
    this.name = 'HttpRequestError'
    this.kind = options.kind
    this.status = options.status
  }
}

/**
 * @description 判断异常是否属于服务不可用错误，页面层可据此决定是否只弹 Toast（轻提示）而不展示表单错误。
 * @param error unknown，任意捕获到的异常。
 * @returns boolean，是否为服务不可用类型的 HttpRequestError。
 */
export function isServiceUnavailableError(error: unknown): error is HttpRequestError {
  return error instanceof HttpRequestError && error.kind === 'service_unavailable'
}
