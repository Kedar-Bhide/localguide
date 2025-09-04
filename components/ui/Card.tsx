import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'hover' | 'interactive' | 'glass'
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export default function Card({ 
  children, 
  className = '', 
  onClick, 
  variant = 'default',
  padding = 'lg',
  shadow = 'md'
}: CardProps) {
  const baseClasses = 'card'
  
  const variants = {
    default: '',
    hover: 'card-hover',
    interactive: 'card-interactive',
    glass: 'card-glass'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }
  
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  const clickableClass = onClick ? 'cursor-pointer' : ''
  
  const classes = [
    baseClasses,
    variants[variant],
    paddingClasses[padding],
    shadowClasses[shadow],
    clickableClass,
    className
  ].filter(Boolean).join(' ')

  const Component = onClick ? 'button' : 'div'
  
  return React.createElement(Component, {
    className: classes,
    onClick,
    ...(onClick && {
      role: 'button',
      tabIndex: 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }
    })
  }, children)
}