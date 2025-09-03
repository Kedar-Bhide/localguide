import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  clickable?: boolean
}

export default function Card({ children, className = '', onClick, clickable = false }: CardProps) {
  const baseClasses = "bg-white rounded-2xl shadow-md border p-6"
  const clickableClasses = clickable ? "cursor-pointer hover:shadow-lg transition-all duration-300 ease-out" : ""
  const classes = `${baseClasses} ${clickableClasses} ${className}`

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