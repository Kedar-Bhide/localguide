'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  MapPin, 
  Star, 
  MessageCircle, 
  Filter,
  Grid3X3,
  List,
  Users,
  Clock,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { cn, formatRelativeTime, debounce } from '@/lib/utils'
import type { SearchResult, SearchQuery } from '@/types'

export default function ExplorePage() {
  const router = useRouter()
  const { user, initialize, initialized } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Data states
  const [locals, setLocals] = useState<SearchResult[]>([])
  const [cities, setCities] = useState<{city: string; country: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  // Popular tags
  const popularTags = [
    'Food & Drinks', 'Nightlife', 'Culture', 'History', 'Art', 'Museums',
    'Shopping', 'Nature', 'Adventure', 'Photography', 'Local Secrets', 'Hidden Gems'
  ]

  // Initialize auth and load data
  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login')
    } else if (user) {
      loadLocals()
      loadCities()
    }
  }, [initialized, user, router])

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    loadLocals({ location: query })
  }, 500)

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery)
    } else {
      loadLocals()
    }
  }, [searchQuery])

  const loadLocals = async (params?: Partial<SearchQuery>) => {
    if (!user) return

    try {
      setSearchLoading(true)
      const query: SearchQuery = {
        location: params?.location,
        city: params?.city || (selectedCity && !params?.location ? selectedCity : undefined),
        tags: params?.tags !== undefined ? params?.tags : (selectedTags.length > 0 ? selectedTags : undefined),
        page: params?.page || 1,
        limit: params?.limit || pagination.limit,
        ...params
      }

      // Remove empty values to avoid unnecessary filters
      Object.keys(query).forEach(key => {
        if (query[key as keyof SearchQuery] === '' || query[key as keyof SearchQuery] === undefined) {
          delete query[key as keyof SearchQuery]
        }
      })

      console.log('Searching with query:', query)
      const response = await api.searchLocalExperts(query)
      console.log('Search response:', response)
      setLocals(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Failed to load locals:', error)
      setLocals([])
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  const loadCities = async () => {
    try {
      const response = await api.getCities()
      setCities(response)
    } catch (error) {
      console.error('Failed to load cities:', error)
    }
  }

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newTags)
    
    // Immediately search with the new tags
    loadLocals({ 
      tags: newTags,
      location: searchQuery.trim() || undefined,
      city: selectedCity || undefined
    })
  }

  const startChat = async (local: SearchResult) => {
    try {
      const chat = await api.createChat(local.user_id, local.city)
      router.push(`/chats/${chat.id}`)
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  const clearFilters = () => {
    setSelectedCity('')
    setSelectedTags([])
    setSearchQuery('')
    loadLocals({ location: undefined, city: undefined, tags: [] })
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-900">
                Discover Local Experts
              </h1>
              <p className="text-neutral-600 mt-1">
                Connect with passionate locals who know their cities inside out
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                leftIcon={<Filter className="h-4 w-4" />}
              >
                Filters
                {(selectedTags.length > 0 || selectedCity) && (
                  <span className="ml-2 bg-primary-100 text-primary-700 text-xs rounded-full px-2 py-1">
                    {selectedTags.length + (selectedCity ? 1 : 0)}
                  </span>
                )}
              </Button>
              
              <div className="flex border border-neutral-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search by city, country, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
              containerClassName="w-full"
              className="text-lg py-4"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Active Filters */}
        <AnimatePresence>
          {(selectedTags.length > 0 || selectedCity) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-neutral-700">Active filters:</span>
                {selectedCity && (
                  <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
                    <MapPin className="h-3 w-3" />
                    {selectedCity}
                    <button
                      onClick={() => {
                        setSelectedCity('')
                        loadLocals({ 
                          city: undefined,
                          location: searchQuery.trim() || undefined,
                          tags: selectedTags.length > 0 ? selectedTags : undefined
                        })
                      }}
                      className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-secondary-100 text-secondary-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="ml-1 hover:bg-secondary-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear all
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="w-16 h-16 bg-neutral-200 rounded-full mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded mb-4"></div>
                <div className="h-8 bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-neutral-600">
                {pagination.total > 0 ? (
                  <>Showing {locals.length} of {pagination.total} local experts</>
                ) : (
                  'No local experts found'
                )}
              </div>
            </div>

            {locals.length > 0 ? (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              )}>
                {locals.map((local, index) => (
                  <motion.div
                    key={local.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      'card-hover group',
                      viewMode === 'list' && 'flex items-center space-x-6 p-6'
                    )}
                  >
                    {viewMode === 'grid' ? (
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar
                            src={local.user.avatar_url}
                            name={local.user.full_name}
                            size="lg"
                            showOnlineStatus
                            isOnline={true}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-neutral-900 truncate">
                              {local.user.full_name}
                            </h3>
                            <div className="flex items-center text-sm text-neutral-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {local.city}, {local.country}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {local.bio}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {local.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {local.tags.length > 3 && (
                            <span className="inline-block bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-full">
                              +{local.tags.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4 text-sm text-neutral-500">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              {local.rating.toFixed(1)}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {local.total_connections}
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-neutral-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatRelativeTime(local.user.last_active_at)}
                          </div>
                        </div>
                        
                        <Button
                          className="w-full group"
                          onClick={() => startChat(local)}
                          leftIcon={<MessageCircle className="h-4 w-4" />}
                        >
                          Start Chat
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Avatar
                          src={local.user.avatar_url}
                          name={local.user.full_name}
                          size="xl"
                          showOnlineStatus
                          isOnline={true}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold text-neutral-900">
                                {local.user.full_name}
                              </h3>
                              <div className="flex items-center text-neutral-500 mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {local.city}, {local.country}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-neutral-500">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                {local.rating.toFixed(1)}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {local.total_connections}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-neutral-600 mb-3 line-clamp-2">
                            {local.bio}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {local.tags.slice(0, 4).map(tag => (
                                <span
                                  key={tag}
                                  className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {local.tags.length > 4 && (
                                <span className="inline-block bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-full">
                                  +{local.tags.length - 4}
                                </span>
                              )}
                            </div>
                            
                            <Button
                              onClick={() => startChat(local)}
                              leftIcon={<MessageCircle className="h-4 w-4" />}
                            >
                              Start Chat
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Globe className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                  {searchQuery || selectedCity || selectedTags.length > 0 
                    ? 'No local experts found for your search'
                    : 'No local experts available yet'}
                </h3>
                <p className="text-neutral-500 mb-6">
                  {searchQuery || selectedCity || selectedTags.length > 0 
                    ? 'Try adjusting your search criteria or explore different cities'
                    : 'Local experts are still setting up their profiles. Check back soon!'}
                </p>
                {(searchQuery || selectedCity || selectedTags.length > 0) && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Local Experts"
        size="lg"
      >
        <div className="space-y-6">
          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value)
                loadLocals({ 
                  city: e.target.value || undefined,
                  location: searchQuery.trim() || undefined,
                  tags: selectedTags.length > 0 ? selectedTags : undefined
                })
              }}
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={`${city.city}-${city.country}`} value={city.city}>
                  {city.city}, {city.country}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Interests & Specialties
            </label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    'px-3 py-2 rounded-full text-sm font-medium transition-colors',
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={clearFilters}
            >
              Clear All
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                loadLocals()
                setShowFilters(false)
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}