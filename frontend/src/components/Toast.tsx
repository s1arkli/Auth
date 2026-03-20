export interface ToastState {
  type: 'success' | 'error'
  message: string
}

interface ToastProps {
  toast: ToastState | null
}

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

