import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

// Static city list for autocomplete (placeholder for now)
const CITIES = [
  'New York, NY, USA',
  'Los Angeles, CA, USA',
  'Chicago, IL, USA',
  'Houston, TX, USA',
  'Phoenix, AZ, USA',
  'Philadelphia, PA, USA',
  'San Antonio, TX, USA',
  'San Diego, CA, USA',
  'Dallas, TX, USA',
  'San Jose, CA, USA',
  'Austin, TX, USA',
  'Jacksonville, FL, USA',
  'Fort Worth, TX, USA',
  'Columbus, OH, USA',
  'Charlotte, NC, USA',
  'San Francisco, CA, USA',
  'Indianapolis, IN, USA',
  'Seattle, WA, USA',
  'Denver, CO, USA',
  'Washington, DC, USA',
  'Boston, MA, USA',
  'El Paso, TX, USA',
  'Nashville, TN, USA',
  'Detroit, MI, USA',
  'Oklahoma City, OK, USA',
  'Portland, OR, USA',
  'Las Vegas, NV, USA',
  'Memphis, TN, USA',
  'Louisville, KY, USA',
  'Baltimore, MD, USA',
  'Milwaukee, WI, USA',
  'Albuquerque, NM, USA',
  'Tucson, AZ, USA',
  'Fresno, CA, USA',
  'Sacramento, CA, USA',
  'Kansas City, MO, USA',
  'Mesa, AZ, USA',
  'Atlanta, GA, USA',
  'Omaha, NE, USA',
  'Colorado Springs, CO, USA',
  'Raleigh, NC, USA',
  'Long Beach, CA, USA',
  'Virginia Beach, VA, USA',
  'Miami, FL, USA',
  'Oakland, CA, USA',
  'Minneapolis, MN, USA',
  'Tulsa, OK, USA',
  'Tampa, FL, USA',
  'Arlington, TX, USA',
  'New Orleans, LA, USA'
]

// Tags from the database
const AVAILABLE_TAGS = [
  'Hiking', 'Nightlife', 'Budget-friendly', 'Museums', 'Foodie Spots',
  'Local Markets', 'Historical Sites', 'Beaches', 'Nature & Parks',
  'Photography', 'Art & Culture', 'Live Music', 'Bars & Pubs',
  'Coffee & Cafes', 'Family-friendly', 'Hidden Gems', 'Architecture',
  'Road Trips', 'Public Transit Tips', 'Shopping', 'Festivals',
  'Outdoor Sports', 'Wellness & Spas', 'Day Trips'
]

interface SearchFormData {
  location: string
  startDate: string
  endDate: string
  selectedTags: string[]
}

interface SearchBoxProps {
  onSearch?: (searchData: SearchFormData) => Promise<void> | void
  className?: string
}

export default function SearchBox({ onSearch, className = '' }: SearchBoxProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState<SearchFormData>({
    location: '',
    startDate: '',
    endDate: '',
    selectedTags: []
  })

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  const locationInputRef = useRef<HTMLInputElement>(null)
  const tagsDropdownRef = useRef<HTMLDivElement>(null)

  // Handle location input change with autocomplete
  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }))
    
    if (value.trim()) {
      const filtered = CITIES.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10)
      setLocationSuggestions(filtered)
      setShowLocationDropdown(true)
    } else {
      setShowLocationDropdown(false)
    }
  }

  // Handle location selection from dropdown
  const handleLocationSelect = (location: string) => {
    setFormData(prev => ({ ...prev, location }))
    setShowLocationDropdown(false)
  }

  // Handle tag selection (limit to 4)
  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const newTags = prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : prev.selectedTags.length < 4
          ? [...prev.selectedTags, tag]
          : prev.selectedTags
      
      return { ...prev, selectedTags: newTags }
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If user is not logged in, show login modal
    if (!user) {
      setShowLoginModal(true)
      return
    }

    // Call onSearch callback if provided
    if (onSearch) {
      setIsSearching(true)
      try {
        await onSearch(formData)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false)
      }
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setShowTagsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Field with Autocomplete */}
          <div className="relative" ref={locationInputRef}>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="Where are you traveling? (city, state, country)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            {/* Location Dropdown */}
            {showLocationDropdown && locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {locationSuggestions.map((location, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Tags Multi-select */}
          <div className="relative" ref={tagsDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (optional, max 4)
            </label>
            <div
              onClick={() => setShowTagsDropdown(!showTagsDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[40px] flex items-center justify-between"
            >
              <div className="flex flex-wrap gap-1">
                {formData.selectedTags.length === 0 ? (
                  <span className="text-gray-500">Select interests...</span>
                ) : (
                  formData.selectedTags.map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTagToggle(tag)
                        }}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
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
                        disabled={!formData.selectedTags.includes(tag) && formData.selectedTags.length >= 4}
                        className={`text-left px-2 py-1 rounded text-sm ${
                          formData.selectedTags.includes(tag)
                            ? 'bg-blue-100 text-blue-800'
                            : formData.selectedTags.length >= 4
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

          <Button type="submit" className="w-full" size="lg" loading={isSearching}>
            Search
          </Button>
        </form>
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Login / Sign up first</h3>
              <p className="text-gray-600 mb-6">
                You need to be logged in to search for locals. Join LocalGuide to connect with vetted locals in your destination.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/login')}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => router.push('/traveler')}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  Sign up as Traveler
                </Button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}