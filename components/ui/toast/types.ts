export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number // in milliseconds, 0 means no auto dismiss
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
  // Convenience methods
  success: (title: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string
  error: (title: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string
  warning: (title: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string
  info: (title: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string
}