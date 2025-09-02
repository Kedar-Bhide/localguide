import { forwardRef, useEffect, useRef, TextareaHTMLAttributes } from 'react'
import FormField, { BaseFormFieldProps, getInputClasses } from './FormField'

interface TextAreaProps extends BaseFormFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  autoResize?: boolean
  minRows?: number
  maxRows?: number
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
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
  placeholder,
  autoResize = true,
  minRows = 3,
  maxRows = 8,
  ...textareaProps
}, ref) => {
  const fieldId = id || `textarea-field-${Math.random().toString(36).substr(2, 9)}`
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current
      const lineHeight = 20 // Approximate line height
      const minHeight = minRows * lineHeight + 16 // +16 for padding
      const maxHeight = maxRows * lineHeight + 16
      
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'
      
      // Calculate new height
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }
  }, [value, autoResize, minRows, maxRows])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e)
    
    // Trigger resize on change if auto-resize is enabled
    if (autoResize) {
      setTimeout(() => {
        if (textareaRef.current) {
          const textarea = textareaRef.current
          const lineHeight = 20
          const minHeight = minRows * lineHeight + 16
          const maxHeight = maxRows * lineHeight + 16
          
          textarea.style.height = 'auto'
          const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
          textarea.style.height = `${newHeight}px`
        }
      }, 0)
    }
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
      <textarea
        ref={textareaRef}
        id={fieldId}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={autoResize ? minRows : textareaProps.rows}
        className={`${getInputClasses(state, disabled, error)} ${autoResize ? 'resize-none overflow-hidden' : 'resize-y'}`}
        style={autoResize ? { minHeight: `${minRows * 20 + 16}px` } : undefined}
        {...textareaProps}
      />
    </FormField>
  )
})

TextArea.displayName = 'TextArea'

export default TextArea