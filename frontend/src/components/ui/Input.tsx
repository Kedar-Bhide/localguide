'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      type,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <input
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'block w-full px-4 py-3 text-neutral-900 bg-white border border-neutral-200 rounded-xl placeholder:text-neutral-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-neutral-300 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              error && 'border-red-300 focus:ring-red-500 focus:border-red-300',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
              onClick={togglePasswordVisibility}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          
          {!isPassword && rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {!error && helperText && (
              <p className="text-sm text-neutral-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }