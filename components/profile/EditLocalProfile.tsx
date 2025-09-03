import { useState, useRef, useEffect } from 'react'
import Button from '../ui/Button'
import { supabase } from '../../lib/supabase'
import { validateName } from '../../utils/validation'
import { MAX_TAGS, MAX_BIO_LENGTH } from '../../utils/constants'

// Available tags from database
const AVAILABLE_TAGS = [
  'Hiking', 'Nightlife', 'Budget-friendly', 'Museums', 'Foodie Spots',
  'Local Markets', 'Historical Sites', 'Beaches', 'Nature & Parks',
  'Photography', 'Art & Culture', 'Live Music', 'Bars & Pubs',
  'Coffee & Cafes', 'Family-friendly', 'Hidden Gems', 'Architecture',
  'Road Trips', 'Public Transit Tips', 'Shopping', 'Festivals',
  'Outdoor Sports', 'Wellness & Spas', 'Day Trips'
]

interface LocalProfileData {
  city: string
  state: string
  country: string
  bio: string
  tags: string[]
}

interface EditLocalProfileProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  userId: string
}

export default function EditLocalProfile({ isOpen, onClose, onSave, userId }: EditLocalProfileProps) {
  const [formData, setFormData] = useState<LocalProfileData>({
    city: '',
    state: '',
    country: '',
    bio: '',
    tags: []
  })

  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const tagsDropdownRef = useRef<HTMLDivElement>(null)

  // Fetch current local profile data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchLocalProfile()
    }
  }, [isOpen, userId])

  const fetchLocalProfile = async () => {
    setFetchingData(true)
    try {
      const { data, error } = await supabase
        .from('locals')
        .select('city, state, country, bio, tags')
        .eq('user_id', userId)
        .single()

      if (error) {
        throw new Error(`Failed to fetch profile: ${error.message}`)
      }

      if (data) {
        setFormData({
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          bio: data.bio || '',
          tags: data.tags || []
        })
      }
    } catch (error: any) {
      console.error('Error fetching local profile:', error)
      setErrors([error.message || 'Failed to load profile data'])
    } finally {
      setFetchingData(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof LocalProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle tag selection (limit to MAX_TAGS)
  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : prev.tags.length < MAX_TAGS
          ? [...prev.tags, tag]
          : prev.tags
      
      return { ...prev, tags: newTags }
    })
  }

  // Form validation
  const validateForm = (): string[] => {
    const newErrors: string[] = []

    if (!validateName(formData.city.trim())) {
      newErrors.push('City must be at least 2 characters')
    }

    if (!validateName(formData.country.trim())) {
      newErrors.push('Country must be at least 2 characters')
    }

    if (formData.bio.trim().length < 50) {
      newErrors.push('Bio must be at least 50 characters')
    }

    if (formData.bio.trim().length > MAX_BIO_LENGTH) {
      newErrors.push(`Bio must be less than ${MAX_BIO_LENGTH} characters`)
    }

    if (formData.tags.length === 0) {
      newErrors.push('Please select at least one tag to describe your expertise')
    }

    return newErrors
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setLoading(false)
      return
    }

    try {
      // 1. Update locals table
      const { error: localError } = await supabase
        .from('locals')
        .update({
          city: formData.city.trim(),
          state: formData.state.trim() || null,
          country: formData.country.trim(),
          bio: formData.bio.trim(),
          tags: formData.tags
        })
        .eq('user_id', userId)

      if (localError) {
        throw new Error(`Failed to update profile: ${localError.message}`)
      }

      // 2. Get tag IDs for selected tags
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', formData.tags)

      if (tagError) {
        throw new Error(`Failed to fetch tags: ${tagError.message}`)
      }

      // 3. Clear existing local_tags and insert new ones
      const { error: deleteError } = await supabase
        .from('local_tags')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.warn('Warning: Could not clear existing tags:', deleteError.message)
      }

      // 4. Insert new local_tags
      if (tagData && tagData.length > 0) {
        const localTagsData = tagData.map(tag => ({
          user_id: userId,
          tag_id: tag.id
        }))

        const { error: insertTagError } = await supabase
          .from('local_tags')
          .insert(localTagsData)

        if (insertTagError) {
          console.warn('Warning: Could not sync local_tags:', insertTagError.message)
        }
      }

      // Success! Close modal and notify parent
      onSave()
      onClose()

    } catch (error: any) {
      console.error('Update profile error:', error)
      setErrors([error.message || 'An error occurred while updating your profile'])
    } finally {
      setLoading(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setShowTagsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Local Profile</h2>
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

          {fetchingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading profile data...</span>
            </div>
          ) : (
            <>
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
                {/* Location Fields */}
                <div className="grid-cards">
                  <div>
                    <label htmlFor="edit-city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="edit-city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-state" className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      id="edit-state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      id="edit-country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Bio Field */}
                <div>
                  <label htmlFor="edit-bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio * <span className="text-sm text-gray-500">(50-{MAX_BIO_LENGTH} characters)</span>
                  </label>
                  <textarea
                    id="edit-bio"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length}/{MAX_BIO_LENGTH} characters
                  </p>
                </div>

                {/* Tags Multi-select */}
                <div className="relative" ref={tagsDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Expertise * <span className="text-sm text-gray-500">(select 1-{MAX_TAGS} tags)</span>
                  </label>
                  <div
                    onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-h-[40px] flex items-center justify-between"
                  >
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.length === 0 ? (
                        <span className="text-gray-500">Select your areas of expertise...</span>
                      ) : (
                        formData.tags.map(tag => (
                          <span 
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTagToggle(tag)
                              }}
                              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                              disabled={loading}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Tags Dropdown */}
                  {showTagsDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="p-2">
                        <div className="grid grid-cols-2 gap-1">
                          {AVAILABLE_TAGS.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTagToggle(tag)}
                              disabled={!formData.tags.includes(tag) && formData.tags.length >= MAX_TAGS}
                              className={`text-left px-2 py-1 rounded text-sm ${
                                formData.tags.includes(tag)
                                  ? 'bg-green-100 text-green-800'
                                  : formData.tags.length >= MAX_TAGS
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-4 border-t">
                  <Button 
                    type="submit" 
                    loading={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    size="lg"
                  >
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}