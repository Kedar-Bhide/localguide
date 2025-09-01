import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  onUploadSuccess: (avatarUrl: string) => void
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  userName?: string
}

export default function AvatarUpload({ 
  userId, 
  currentAvatarUrl, 
  onUploadSuccess, 
  size = 'md',
  showName = false,
  userName = ''
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const uploadAvatar = async (file: File) => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB')
      }

      // Get file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const allowedTypes = ['jpg', 'jpeg', 'png', 'webp']
      
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        throw new Error('File must be JPG, PNG, or WebP format')
      }

      // Create file path: userId/avatar.ext
      const fileName = `avatar.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Delete existing avatar if it exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${oldPath}`])
        }
      }

      // Upload new avatar
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          metadata: {
            owner: userId
          }
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: filePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`)
      }

      onUploadSuccess(urlData.publicUrl)

    } catch (error: any) {
      console.error('Avatar upload error:', error)
      setError(error.message || 'Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadAvatar(file)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const renderAvatar = () => {
    if (currentAvatarUrl) {
      return (
        <img
          src={currentAvatarUrl}
          alt={`${userName} avatar`}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      )
    }

    return (
      <div className={`${sizeClasses[size]} bg-blue-100 rounded-full flex items-center justify-center`}>
        <span className={`font-medium text-blue-600 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}`}>
          {userName?.charAt(0).toUpperCase() || 'U'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative group">
        {renderAvatar()}
        
        {/* Upload overlay */}
        <button
          onClick={triggerFileSelect}
          disabled={uploading}
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed`}
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {showName && userName && (
        <span className="text-sm font-medium text-gray-700">{userName}</span>
      )}

      {error && (
        <p className="text-xs text-red-600 text-center max-w-xs">{error}</p>
      )}

      {size === 'lg' && (
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Click to upload a new avatar. JPG, PNG, or WebP up to 2MB.
        </p>
      )}
    </div>
  )
}