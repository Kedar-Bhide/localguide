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
  const baseClasses = "font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[48px] flex items-center justify-center"
  
  const variantClasses = {
    primary: "bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-600)] active:bg-[color:var(--primary-700)] focus:ring-[color:var(--primary-500)] hover:shadow-md active:scale-[0.98]",
    secondary: "border-2 border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 active:bg-neutral-100 focus:ring-[color:var(--primary-500)] hover:border-neutral-400",
    tertiary: "text-neutral-500 hover:text-neutral-700 active:text-neutral-900 focus:ring-[color:var(--primary-500)] hover:bg-neutral-50 active:bg-neutral-100"
  }
  
  const sizeClasses = {
    sm: "px-5 py-2.5 text-sm",
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