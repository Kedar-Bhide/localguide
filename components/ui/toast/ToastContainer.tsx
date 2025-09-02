import React from 'react'
import { createPortal } from 'react-dom'
import { useToast } from './ToastContext'
import Toast from './Toast'

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  className?: string
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
}

export default function ToastContainer({ 
  position = 'top-right',
  className = ''
}: ToastContainerProps) {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) {
    return null
  }

  const containerContent = (
    <div
      className={`
        fixed z-50 pointer-events-none flex flex-col gap-2 w-full max-w-sm
        ${positionClasses[position]}
        ${className}
      `}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            transition-all duration-300 ease-out transform
            ${position.includes('top') ? 'animate-in slide-in-from-top-2' : 'animate-in slide-in-from-bottom-2'}
          `}
        >
          <Toast
            toast={toast}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  )

  // Use portal to render toasts at body level to avoid z-index issues
  if (typeof window !== 'undefined') {
    return createPortal(containerContent, document.body)
  }

  return null
}