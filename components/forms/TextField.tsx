import { forwardRef, InputHTMLAttributes } from 'react'
import FormField, { BaseFormFieldProps, getInputClasses } from './FormField'

interface TextFieldProps extends BaseFormFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
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
  type = 'text',
  placeholder,
  ...inputProps
}, ref) => {
  const fieldId = id || `text-field-${Math.random().toString(36).substr(2, 9)}`
  
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
      <input
        ref={ref}
        id={fieldId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={getInputClasses(state, disabled, error)}
        {...inputProps}
      />
    </FormField>
  )
})

TextField.displayName = 'TextField'

export default TextField