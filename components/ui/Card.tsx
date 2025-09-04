import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  clickable?: boolean
}

export default function Card({ children, className = '', onClick, clickable = false }: CardProps) {
  const baseClasses = "bg-white rounded-2xl border border-neutral-200 p-6"
  const shadowClasses = "shadow-soft animate-fade-slide"
  const hoverClasses = (onClick || clickable) ? "cursor-pointer animate-card-hover" : ""
  const classes = `${baseClasses} ${shadowClasses} ${hoverClasses} ${className}`

  if (onClick) {
    return (
      <div className={classes} onClick={onClick}>
        {children}
      </div>
    )
  }

  return (
    <div className={classes}>
      {children}
    </div>
  )
}