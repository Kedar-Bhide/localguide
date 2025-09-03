import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = "font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] flex items-center justify-center"
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-600 focus:ring-primary-500",
    secondary: "bg-secondary text-white hover:bg-secondary-600 focus:ring-secondary-500",
    outline: "border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:ring-primary-500"
  }
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  }
  
  const disabledClasses = (disabled || loading) ? "opacity-50 cursor-not-allowed" : ""
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : children}
    </button>
  )
}