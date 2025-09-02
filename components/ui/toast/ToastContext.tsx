import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastContextType, ToastType } from './types'

const ToastContext = createContext<ToastContextType | null>(null)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = generateId()
    const toast: Toast = {
      id,
      duration: 5000, // 5 seconds default
      ...toastData
    }
    
    setToasts(prev => [...prev, toast])
    
    // Auto dismiss if duration > 0
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
    
    return id
  }, [generateId])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id)
      if (toast?.onDismiss) {
        toast.onDismiss()
      }
      return prev.filter(t => t.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    setToasts(prev => {
      // Call onDismiss for all toasts
      prev.forEach(toast => {
        if (toast.onDismiss) {
          toast.onDismiss()
        }
      })
      return []
    })
  }, [])

  const createToastMethod = useCallback((type: ToastType) => {
    return (title: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => {
      return addToast({ type, title, ...options })
    }
  }, [addToast])

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success: createToastMethod('success'),
    error: createToastMethod('error'),
    warning: createToastMethod('warning'),
    info: createToastMethod('info')
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}