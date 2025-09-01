import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import LocalCard from '../components/ui/LocalCard'
import { searchLocalsSorted, findOrCreateChat, getNearbyLocals, type NearbyCity } from '../utils/api'
import { getUser, supabase } from '../lib/supabase'
import type { LocalSearchResult, LocalCardData } from '../types'

interface SearchParams {
  location?: string
  city?: string
  country?: string
  startDate?: string
  endDate?: string
  tags?: string[]
  searchId?: string
}

type SortOption = 'best_match' | 'most_active'

export default function ConnectWithLocals() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [locals, setLocals] = useState<LocalSearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [nearbyCities, setNearbyCities] = useState<NearbyCity[]>([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('best_match')

  useEffect(() => {
    if (router.isReady) {
      const { location, city, country, startDate, endDate, tags, searchId } = router.query
      
      const params = {
        location: location as string || '',
        city: city as string || '',
        country: country as string || 'USA',
        startDate: startDate as string || '',
        endDate: endDate as string || '',
        tags: tags ? (tags as string).split(',') : [],
        searchId: searchId as string || ''
      }
      
      setSearchParams(params)
      setLoading(false)
      
      // Perform search if we have city
      if (params.city) {
        performSearch(params.city, params.country, params.tags)
      }
    }
  }, [router.isReady, router.query])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const performSearch = async (city: string, country: string, tags: string[], sortOption?: SortOption) => {
    setSearchLoading(true)
    setNearbyCities([]) // Reset nearby cities
    try {
      const results = await searchLocalsSorted(city, country, tags, sortOption || sortBy)
      setLocals(results)
      
      // If no locals found, try to find nearby cities with locals
      if (results.length === 0) {
        setNearbyLoading(true)
        try {
          const nearbyResults = await getNearbyLocals(city, country)
          setNearbyCities(nearbyResults)
        } catch (nearbyError) {
          console.error('Error fetching nearby cities:', nearbyError)
        } finally {
          setNearbyLoading(false)
        }
      }
    } catch (error) {
      console.error('Error searching locals:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleNewSearch = () => {
    router.push('/explore')
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    if (searchParams.city) {
      performSearch(searchParams.city, searchParams.country || 'USA', searchParams.tags || [], newSort)
    }
  }

  const transformToLocalCardData = (local: LocalSearchResult): LocalCardData => {
    return {
      id: local.id,
      user_id: local.user_id,
      city: local.city,
      country: local.country,
      bio: local.bio,
      tags: local.tags,
      user: {
        full_name: local.user.full_name,
        avatar_url: local.user.avatar_url,
        last_active_at: local.user.last_active_at
      }
    }
  }

  const handleNearbyCityClick = (nearbyCity: NearbyCity) => {
    // Build URL with nearby city parameters and preserve existing search parameters
    const params = new URLSearchParams({
      city: nearbyCity.city,
      country: nearbyCity.country,
      location: `${nearbyCity.city}, ${nearbyCity.country}`
    })
    
    // Include existing search parameters (dates, tags) if they exist
    if (searchParams.startDate) {
      params.set('startDate', searchParams.startDate)
    }
    if (searchParams.endDate) {
      params.set('endDate', searchParams.endDate)
    }
    if (searchParams.tags && searchParams.tags.length > 0) {
      params.set('tags', searchParams.tags.join(','))
    }
    
    router.push(`/connect-with-locals?${params.toString()}`)
  }

  const handleConnect = async (local: LocalSearchResult) => {
    try {
      // Get current user
      const user = await getUser()
      if (!user) {
        console.error('User not authenticated')
        return
      }

      // Create or find existing chat
      const chat = await findOrCreateChat(
        user.id, // traveler ID
        local.user_id, // local ID  
        searchParams.city || local.city // city from search or local's city
      )

      // Navigate to the chat
      router.push(`/messages/${chat.id}`)
    } catch (error) {
      console.error('Error creating/opening chat:', error)
      // TODO: Show user-friendly error message
    }
  }

  if (loading) {
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
          <title>Connect with Locals - LocalGuide</title>
          <meta name="description" content="Connect with local experts in your destination" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Connect with Locals</h1>
            <p className="text-gray-600">
              Find and connect with vetted local experts in your destination
            </p>
          </div>

          {/* Search Summary */}
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl font-semibold mb-2">Your Search</h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>Location:</strong> {searchParams.location || 'Not specified'}</div>
                  {searchParams.startDate && (
                    <div><strong>Start Date:</strong> {formatDate(searchParams.startDate)}</div>
                  )}
                  {searchParams.endDate && (
                    <div><strong>End Date:</strong> {formatDate(searchParams.endDate)}</div>
                  )}
                  {searchParams.tags && searchParams.tags.length > 0 && (
                    <div className="flex items-start gap-2">
                      <strong>Tags:</strong>
                      <div className="flex flex-wrap gap-1">
                        {searchParams.tags.map(tag => (
                          <span 
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleNewSearch}
                variant="outline"
                size="sm"
              >
                New Search
              </Button>
            </div>
          </Card>

          {/* Search Results */}
          {searchLoading ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Searching for Local Experts...</h2>
              </div>
              {/* Loading Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <LocalCard key={`skeleton-${i}`} loading={true} />
                ))}
              </div>
            </div>
          ) : locals.length > 0 ? (
            <div>
              {/* Results Header with Sorting */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Local Experts ({locals.length})</h2>
                  <p className="text-gray-600">Find the perfect local guide for your trip</p>
                </div>
                
                {/* Sorting Chips */}
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => handleSortChange('best_match')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      sortBy === 'best_match'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Best match
                  </button>
                  <button
                    onClick={() => handleSortChange('most_active')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      sortBy === 'most_active'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Most active
                  </button>
                </div>
              </div>
              
              {/* Responsive Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {locals.map((local) => (
                  <LocalCard 
                    key={local.id} 
                    data={transformToLocalCardData(local)}
                    onClick={() => handleConnect(local)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* No locals found message */}
              <Card>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    We don't have locals in {searchParams.city || searchParams.location} yet.
                  </h3>
                  <p className="text-gray-600">
                    But we're checking for local experts in nearby cities...
                  </p>
                </div>
              </Card>

              {/* Nearby cities fallback */}
              {nearbyLoading ? (
                <Card>
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">Finding nearby cities with local experts...</span>
                  </div>
                </Card>
              ) : nearbyCities.length > 0 ? (
                <Card>
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nearby options:</h3>
                      <p className="text-gray-600 text-sm">
                        Local experts are available in these nearby cities
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {nearbyCities.map((nearbyCity, index) => (
                        <button
                          key={index}
                          onClick={() => handleNearbyCityClick(nearbyCity)}
                          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                                {nearbyCity.city}, {nearbyCity.country}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {nearbyCity.local_count} local expert{nearbyCity.local_count !== 1 ? 's' : ''} available
                              </p>
                            </div>
                            <svg 
                              className="w-5 h-5 text-gray-400 group-hover:text-blue-600" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-6">
                      No local experts found in nearby cities either.
                      Try expanding your search or checking a different location.
                    </p>
                    
                    <div className="space-x-4">
                      <Button onClick={handleNewSearch} variant="outline">
                        Try Different Search
                      </Button>
                      <Button onClick={() => router.push('/home')} variant="primary">
                        Back to Home
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}