import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import Button from '../ui/Button'
import AvatarUpload from './AvatarUpload'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ProfileData {
  full_name: string
  avatar_url: string | null
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth()
  const { profile, refetch } = useProfile()
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    avatar_url: null
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Load current profile data when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || null
      })
      
      // Get avatar public URL if available
      if (profile.avatar_url) {
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(profile.avatar_url)
        setAvatarUrl(data.publicUrl)
      }
    }
  }, [isOpen, profile])

  const validateForm = (): string[] => {
    const newErrors: string[] = []

    if (!formData.full_name.trim()) {
      newErrors.push('Full name is required')
    }

    if (formData.full_name.trim().length < 2) {
      newErrors.push('Full name must be at least 2 characters')
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setErrors([])

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`)
      }

      // Refetch profile data to update the UI
      await refetch()
      onClose()

    } catch (error: any) {
      console.error('Profile update error:', error)
      setErrors([error.message || 'Failed to update profile'])
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl)
    setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }))
    // Refetch profile data to update the header
    refetch()
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center">
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={avatarUrl}
                onUploadSuccess={handleAvatarUpload}
                size="lg"
                showName={false}
                userName={formData.full_name}
              />
            </div>

            {/* Full Name Field */}
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="full-name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Enter your full name"
              />
            </div>

            <div className="flex space-x-4 pt-4 border-t">
              <Button 
                type="submit" 
                loading={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                size="lg"
              >
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                disabled={loading}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}