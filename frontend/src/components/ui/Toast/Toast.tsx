/** 负责渲染全局轻提示组件。 */
export interface ToastState {
  type: 'success' | 'error'
  message: string
}

interface ToastProps {
  toast: ToastState | null
}

/**
 * @description 根据传入状态渲染成功或失败提示；无提示时不输出任何 DOM（文档对象模型）节点。
 * @param props ToastProps，当前待显示的提示状态。
 * @returns React Toast 组件或 null。
 */
export function Toast({ toast }: ToastProps) {
  if (!toast) {
    return null
  }

  return (
    <div className={`toast toast--${toast.type}`} role="status" aria-live="polite">
      <span className="toast__dot" />
      <span>{toast.message}</span>
    </div>
  )
}
