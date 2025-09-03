import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary'
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
  const baseClasses = "font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] flex items-center justify-center"
  
  const variantClasses = {
    primary: "bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-600)] active:bg-[color:var(--primary-700)] focus:ring-[color:var(--primary-500)] hover:shadow-lg active:scale-[0.98]",
    secondary: "border-2 border-[color:var(--neutral-300)] text-[color:var(--neutral-700)] bg-white hover:bg-[color:var(--neutral-50)] active:bg-[color:var(--neutral-100)] focus:ring-[color:var(--primary-500)] hover:border-[color:var(--neutral-400)]",
    tertiary: "text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)] active:text-[color:var(--text-primary)] focus:ring-[color:var(--primary-500)] hover:bg-[color:var(--neutral-50)] active:bg-[color:var(--neutral-100)]"
  }
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
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