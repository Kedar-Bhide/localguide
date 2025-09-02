import { ReactNode } from 'react'

export type FormFieldState = 'default' | 'error' | 'success' | 'loading'

export interface BaseFormFieldProps {
  label?: string
  description?: string
  error?: string
  success?: string
  required?: boolean
  disabled?: boolean
  state?: FormFieldState
  className?: string
  id?: string
}

interface FormFieldProps extends BaseFormFieldProps {
  children: ReactNode
}

export default function FormField({
  label,
  description,
  error,
  success,
  required,
  disabled,
  state = 'default',
  className = '',
  id,
  children
}: FormFieldProps) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`

  // Determine the actual state based on props
  const actualState = error ? 'error' : success ? 'success' : state

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={fieldId}
          className={`block text-sm font-medium transition-colors ${
            disabled ? 'text-gray-400' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 -mt-1">
          {description}
        </p>
      )}

      {/* Input Field */}
      <div className="relative">
        {children}
        
        {/* Success Icon */}
        {actualState === 'success' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Loading Icon */}
        {actualState === 'loading' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}

      {/* Success Message */}
      {success && !error && (
        <p className="text-xs text-green-600 flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{success}</span>
        </p>
      )}
    </div>
  )
}

// Utility function to get input classes based on state
export const getInputClasses = (state: FormFieldState, disabled?: boolean, error?: string) => {
  const baseClasses = `
    block w-full px-3 py-2 border rounded-md text-sm
    placeholder-gray-500 transition-colors duration-200
    focus:outline-none focus:ring-1
  `.trim()

  let stateClasses = ''
  
  if (disabled) {
    stateClasses = 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300'
  } else if (error || state === 'error') {
    stateClasses = 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
  } else if (state === 'success') {
    stateClasses = 'border-green-300 text-green-900 placeholder-green-300 focus:ring-green-500 focus:border-green-500 pr-10'
  } else if (state === 'loading') {
    stateClasses = 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 pr-10'
  } else {
    stateClasses = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
  }

  return `${baseClasses} ${stateClasses}`
}