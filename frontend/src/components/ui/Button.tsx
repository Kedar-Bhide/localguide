'use client'

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus-visible:ring-primary-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0',
        destructive:
          'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
        outline:
          'border border-primary-200 bg-white text-primary-700 hover:bg-primary-50 hover:border-primary-300 focus-visible:ring-primary-500 shadow-soft hover:shadow-soft-lg',
        secondary:
          'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-500',
        ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-500',
        link: 'text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500',
        success:
          'bg-gradient-to-r from-success-600 to-success-700 text-white hover:from-success-700 hover:to-success-800 focus-visible:ring-success-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
        glow: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-glow-lg focus-visible:ring-primary-500 shadow-glow transform hover:-translate-y-0.5'
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className={cn('h-4 w-4 animate-spin', children && 'mr-2')} />
        )}
        {!loading && leftIcon && (
          <span className={cn('flex-shrink-0', children && 'mr-2')}>
            {leftIcon}
          </span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className={cn('flex-shrink-0', children && 'ml-2')}>
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }