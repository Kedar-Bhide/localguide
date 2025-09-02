import { useState, useRef, useEffect } from 'react'
import FormField, { BaseFormFieldProps } from './FormField'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends BaseFormFieldProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
}

export default function Select({
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
  placeholder = "Select an option...",
  searchable = false,
  clearable = false
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const fieldId = id || `select-field-${Math.random().toString(36).substr(2, 9)}`
  const selectRef = useRef<HTMLDivElement>(null)
  
  // Filter options based on search term
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  // Get selected option
  const selectedOption = options.find(option => option.value === value)

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
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const getSelectClasses = () => {
    const baseClasses = `
      w-full px-3 py-2 border rounded-md text-sm bg-white
      cursor-pointer transition-colors duration-200
      focus:outline-none focus:ring-1 flex items-center justify-between
    `.trim()

    let stateClasses = ''
    
    if (disabled) {
      stateClasses = 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300'
    } else if (error || state === 'error') {
      stateClasses = 'border-red-300 focus:ring-red-500 focus:border-red-500'
    } else if (state === 'success') {
      stateClasses = 'border-green-300 focus:ring-green-500 focus:border-green-500'
    } else {
      stateClasses = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
    }

    return `${baseClasses} ${stateClasses}`
  }

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
        {/* Select Button */}
        <div
          id={fieldId}
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={getSelectClasses()}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <div className="flex items-center space-x-1">
            {/* Clear Button */}
            {clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-100 rounded"
                tabIndex={-1}
              >
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {/* Dropdown Arrow */}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            )}

            {/* Options */}
            <div role="listbox">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchable && searchTerm ? 'No matching options' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    disabled={option.disabled}
                    className={`
                      w-full text-left px-3 py-2 text-sm transition-colors
                      ${option.value === value 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'text-gray-900 hover:bg-gray-100'
                      }
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => !option.disabled && handleOptionClick(option.value)}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </FormField>
  )
}