import React from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'btn focus-ring'
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    tertiary: 'btn-tertiary',
    ghost: 'btn-ghost',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-red-200'
  }
  
  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md', 
    lg: 'btn-lg',
    xl: 'btn-xl'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  const disabledClass = (disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
  
  const classes = [
    baseClasses,
    variants[variant],
    sizes[size],
    widthClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ')
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      )}
      {children}
    </button>
  )
}