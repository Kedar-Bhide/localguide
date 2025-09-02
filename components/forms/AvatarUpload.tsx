import { useState, useRef, useCallback } from 'react'
import FormField, { BaseFormFieldProps } from './FormField'
import { supabase } from '../../lib/supabase'

interface AvatarUploadProps extends BaseFormFieldProps {
  value?: string | null // Avatar URL or file path
  onChange: (avatarUrl: string | null) => void
  bucket?: string
  maxSize?: number // in MB
  allowedTypes?: string[]
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-20 h-20',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
}

export default function AvatarUpload({
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
  bucket = 'avatars',
  maxSize = 5, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  size = 'lg'
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const fieldId = id || `avatar-upload-${Math.random().toString(36).substr(2, 9)}`

  // Get current avatar URL
  const currentAvatarUrl = value ? (
    value.startsWith('http') ? value : supabase.storage.from(bucket).getPublicUrl(value).data.publicUrl
  ) : null

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type not supported. Please use: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size too large. Maximum size is ${maxSize}MB`
    }
    
    return null
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    
    try {
      setUploading(true)
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) throw error
      
      return data.path
    } catch (error) {
      console.error('Upload error:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      // You might want to show this error via a callback or state management
      console.error('Validation error:', validationError)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    const uploadedPath = await uploadFile(file)
    if (uploadedPath) {
      onChange(uploadedPath)
    } else {
      setPreview(null)
    }
  }, [onChange, maxSize, allowedTypes, bucket])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemove = () => {
    onChange(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  const displayImage = preview || currentAvatarUrl
  const actualState = uploading ? 'loading' : state

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      success={success}
      required={required}
      disabled={disabled || uploading}
      state={actualState}
      className={className}
      id={fieldId}
    >
      <div className="flex items-center space-x-4">
        {/* Avatar Preview */}
        <div
          className={`
            ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-dashed
            transition-all duration-200 relative group
            ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
            ${displayImage ? 'border-solid' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {displayImage ? (
            <>
              <img
                src={displayImage}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89L8.86 4.23A2 2 0 0110.52 3.5h2.96a2 2 0 011.66.73L16.07 6.1A2 2 0 0017.93 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                <>
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-xs text-center">Add Photo</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleClick}
              disabled={disabled || uploading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : displayImage ? 'Change' : 'Upload'}
            </button>
            
            {displayImage && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || uploading}
                className="px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove
              </button>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            {allowedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()}, max {maxSize}MB
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </FormField>
  )
}