import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { validateName } from '../utils/validation'
import { MAX_TAGS, MAX_BIO_LENGTH } from '../utils/constants'

// Available tags from database
const AVAILABLE_TAGS = [
  'Hiking', 'Nightlife', 'Budget-friendly', 'Museums', 'Foodie Spots',
  'Local Markets', 'Historical Sites', 'Beaches', 'Nature & Parks',
  'Photography', 'Art & Culture', 'Live Music', 'Bars & Pubs',
  'Coffee & Cafes', 'Family-friendly', 'Hidden Gems', 'Architecture',
  'Road Trips', 'Public Transit Tips', 'Shopping', 'Festivals',
  'Outdoor Sports', 'Wellness & Spas', 'Day Trips'
]

interface LocalFormData {
  city: string
  state: string
  country: string
  bio: string
  selectedTags: string[]
}

export default function BecomeALocal() {
  const router = useRouter()
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  
  const [formData, setFormData] = useState<LocalFormData>({
    city: '',
    state: '',
    country: 'USA', // Default to USA
    bio: '',
    selectedTags: []
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const tagsDropdownRef = useRef<HTMLDivElement>(null)

  // Redirect if user is already a local
  useEffect(() => {
    if (!profileLoading && profile?.is_local) {
      router.push('/requests')
    }
  }, [profile, profileLoading, router])

  // Handle input changes
  const handleInputChange = (field: keyof LocalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle tag selection (limit to MAX_TAGS)
  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const newTags = prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : prev.selectedTags.length < MAX_TAGS
          ? [...prev.selectedTags, tag]
          : prev.selectedTags
      
      return { ...prev, selectedTags: newTags }
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

    if (formData.selectedTags.length === 0) {
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

    if (!user) {
      setErrors(['You must be logged in to become a local'])
      setLoading(false)
      return
    }

    try {
      // Start a transaction-like operation
      // 1. Update profile to set is_local = true
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_local: true })
        .eq('id', user.id)

      if (profileError) {
        throw new Error(`Failed to update profile: ${profileError.message}`)
      }

      // 2. Upsert into locals table
      const { error: localError } = await supabase
        .from('locals')
        .upsert({
          user_id: user.id,
          city: formData.city.trim(),
          state: formData.state.trim() || null,
          country: formData.country.trim(),
          bio: formData.bio.trim(),
          tags: formData.selectedTags
        })

      if (localError) {
        throw new Error(`Failed to create local profile: ${localError.message}`)
      }

      // 3. Get tag IDs for selected tags
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', formData.selectedTags)

      if (tagError) {
        throw new Error(`Failed to fetch tags: ${tagError.message}`)
      }

      // 4. Clear existing local_tags and insert new ones
      const { error: deleteError } = await supabase
        .from('local_tags')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        console.warn('Warning: Could not clear existing tags:', deleteError.message)
      }

      // 5. Insert new local_tags
      if (tagData && tagData.length > 0) {
        const localTagsData = tagData.map(tag => ({
          user_id: user.id,
          tag_id: tag.id
        }))

        const { error: insertTagError } = await supabase
          .from('local_tags')
          .insert(localTagsData)

        if (insertTagError) {
          console.warn('Warning: Could not sync local_tags:', insertTagError.message)
        }
      }

      // Success! Redirect to /requests
      router.push('/requests')

    } catch (error: any) {
      console.error('Become local error:', error)
      setErrors([error.message || 'An error occurred while setting up your local profile'])
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

  if (profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Become a Local - LocalGuide</title>
          <meta name="description" content="Join as a local expert and share your city knowledge with travelers" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="max-w-2xl mx-auto px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Become a Local</h1>
            <p className="text-gray-600">
              Share your local expertise and help travelers discover the authentic side of your city.
            </p>
          </div>

          <Card>
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
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="San Francisco"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="CA"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="USA"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio * <span className="text-sm text-gray-500">(50-{MAX_BIO_LENGTH} characters)</span>
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
                  placeholder="Tell travelers about yourself! What makes you passionate about your city? What unique experiences can you share? What's your local expertise?"
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
                    {formData.selectedTags.length === 0 ? (
                      <span className="text-gray-500">Select your areas of expertise...</span>
                    ) : (
                      formData.selectedTags.map(tag => (
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
                            disabled={!formData.selectedTags.includes(tag) && formData.selectedTags.length >= MAX_TAGS}
                            className={`text-left px-2 py-1 rounded text-sm ${
                              formData.selectedTags.includes(tag)
                                ? 'bg-green-100 text-green-800'
                                : formData.selectedTags.length >= MAX_TAGS
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

              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  loading={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  size="lg"
                >
                  Become a Local
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => router.back()}
                  disabled={loading}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}