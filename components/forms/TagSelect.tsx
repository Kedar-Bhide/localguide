import { useState, useRef, useEffect } from 'react'
import FormField, { BaseFormFieldProps } from './FormField'
import { SelectOption } from './Select'

interface TagSelectProps extends BaseFormFieldProps {
  value: string[]
  onChange: (values: string[]) => void
  options: SelectOption[]
  placeholder?: string
  maxSelections?: number
  searchable?: boolean
}

export default function TagSelect({
  label,
  description,
  error,
  success,
  required,
  disabled,
  state = 'default',
  className,
  id,
  value,
  onChange,
  options,
  placeholder = "Select tags...",
  maxSelections,
  searchable = true
}: TagSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const fieldId = id || `tag-select-field-${Math.random().toString(36).substr(2, 9)}`
  const selectRef = useRef<HTMLDivElement>(null)
  
  // Filter options based on search term and already selected values
  const filteredOptions = options.filter(option => {
    const matchesSearch = !searchable || option.label.toLowerCase().includes(searchTerm.toLowerCase())
    const notSelected = !value.includes(option.value)
    return matchesSearch && notSelected && !option.disabled
  })

  // Get selected options for display
  const selectedOptions = value.map(val => options.find(opt => opt.value === val)).filter(Boolean) as SelectOption[]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleOptionClick = (optionValue: string) => {
    if (maxSelections && value.length >= maxSelections) return
    
    const newValue = [...value, optionValue]
    onChange(newValue)
    setSearchTerm('')
  }

  const handleRemoveTag = (tagValue: string) => {
    const newValue = value.filter(v => v !== tagValue)
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
    } else if (e.key === 'Backspace' && !searchTerm && value.length > 0) {
      // Remove last tag with backspace
      handleRemoveTag(value[value.length - 1])
    }
  }

  const getSelectClasses = () => {
    const baseClasses = `
      w-full min-h-[38px] px-3 py-2 border rounded-md text-sm bg-white
      cursor-text transition-colors duration-200
      focus-within:outline-none focus-within:ring-1
    `.trim()

    let stateClasses = ''
    
    if (disabled) {
      stateClasses = 'bg-gray-50 cursor-not-allowed border-gray-300'
    } else if (error || state === 'error') {
      stateClasses = 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500'
    } else if (state === 'success') {
      stateClasses = 'border-green-300 focus-within:ring-green-500 focus-within:border-green-500'
    } else {
      stateClasses = 'border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500 hover:border-gray-400'
    }

    return `${baseClasses} ${stateClasses}`
  }

  const isMaxReached = maxSelections && value.length >= maxSelections

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      success={success}
      required={required}
      disabled={disabled}
      state={state}
      className={className}
      id={fieldId}
    >
      <div ref={selectRef} className="relative">
        {/* Tags Container */}
        <div
          className={getSelectClasses()}
          onClick={() => !disabled && !isOpen && setIsOpen(true)}
        >
          <div className="flex flex-wrap gap-1.5 items-center min-h-[22px]">
            {/* Selected Tags */}
            {selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
              >
                <span>{option.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveTag(option.value)
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    tabIndex={-1}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </span>
            ))}

            {/* Input/Placeholder */}
            <div className="flex-1 min-w-[120px]">
              {isOpen ? (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchable ? "Search tags..." : ""}
                  className="w-full border-0 outline-none text-sm bg-transparent"
                  autoFocus
                  disabled={disabled || isMaxReached}
                />
              ) : (
                <span
                  className={`text-sm ${
                    value.length === 0 ? 'text-gray-500' : 'text-gray-900'
                  } ${disabled ? 'cursor-not-allowed' : 'cursor-text'}`}
                  onClick={() => !disabled && setIsOpen(true)}
                >
                  {value.length === 0 ? placeholder : ''}
                </span>
              )}
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              {maxSelections && (
                <span className={isMaxReached ? 'text-orange-500' : ''}>
                  {value.length}/{maxSelections}
                </span>
              )}
              {!isOpen && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {isMaxReached 
                  ? `Maximum ${maxSelections} selections reached`
                  : searchTerm 
                    ? 'No matching options' 
                    : 'All options selected'
                }
              </div>
            ) : (
              <div>
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleOptionClick(option.value)}
                    disabled={isMaxReached}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </FormField>
  )
}