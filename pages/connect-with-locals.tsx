import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import LocalCard from '../components/ui/LocalCard'
import { NoLocalsFound, NoNearbyFound } from '../components/ui/EmptyState'
import NearbyBanner from '../components/ui/NearbyBanner'
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

  const handleChangeTags = () => {
    // Navigate back to explore with current location but allow tag modification
    const params = new URLSearchParams()
    if (searchParams.location) params.set('location', searchParams.location)
    if (searchParams.city) params.set('city', searchParams.city)
    if (searchParams.country) params.set('country', searchParams.country)
    if (searchParams.startDate) params.set('startDate', searchParams.startDate)
    if (searchParams.endDate) params.set('endDate', searchParams.endDate)
    
    router.push(`/explore?${params.toString()}`)
  }

  const handleBackToHome = () => {
    router.push('/home')
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

        <div className="container-grid">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-3">Connect with Local Experts</h1>
            <p className="text-xl text-neutral-600">
              Discover authentic experiences with vetted local guides in your destination
            </p>
          </div>

          {/* Search Summary */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-3xl p-8 mb-8 border border-neutral-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Your Search Criteria</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-xl">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold text-neutral-800">{searchParams.location || 'Location not specified'}</span>
                  </div>
                  
                  {(searchParams.startDate || searchParams.endDate) && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-secondary-100 rounded-xl">
                        <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-lg font-semibold text-neutral-800">
                        {searchParams.startDate && formatDate(searchParams.startDate)}
                        {searchParams.startDate && searchParams.endDate && ' - '}
                        {searchParams.endDate && formatDate(searchParams.endDate)}
                      </span>
                    </div>
                  )}
                  
                  {searchParams.tags && searchParams.tags.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-warning/10 rounded-xl">
                        <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchParams.tags.map(tag => (
                          <span 
                            key={tag}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-white text-neutral-700 border border-neutral-200 shadow-sm"
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
                variant="secondary"
                className="px-6 py-3 text-lg font-semibold border-2 border-neutral-300 hover:border-primary-500 hover:text-primary-600"
              >
                Refine Search
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchLoading ? (
            <div>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center space-x-3 bg-white rounded-3xl px-8 py-4 shadow-lg border border-neutral-100">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
                  <span className="text-lg font-semibold text-neutral-700">Finding perfect local experts for you...</span>
                </div>
              </div>
              {/* Loading Grid */}
              <div className="grid-cards-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <LocalCard key={`skeleton-${i}`} loading={true} />
                ))}
              </div>
            </div>
          ) : locals.length > 0 ? (
            <div>
              {/* Results Header with Sorting */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                    {locals.length} Local {locals.length === 1 ? 'Expert' : 'Experts'} Found
                  </h2>
                  <p className="text-lg text-neutral-600">Connect with verified guides who know your destination inside out</p>
                </div>
                
                {/* Sorting Chips */}
                <div className="flex gap-3 mt-6 lg:mt-0">
                  <button
                    onClick={() => handleSortChange('best_match')}
                    aria-label={`Sort by best match${sortBy === 'best_match' ? ' (currently selected)' : ''}`}
                    aria-pressed={sortBy === 'best_match'}
                    className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border-2 ${
                      sortBy === 'best_match'
                        ? 'bg-primary-500 text-white border-primary-500 shadow-lg'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-md'
                    }`}
                  >
                    Best Match
                  </button>
                  <button
                    onClick={() => handleSortChange('most_active')}
                    aria-label={`Sort by most active${sortBy === 'most_active' ? ' (currently selected)' : ''}`}
                    aria-pressed={sortBy === 'most_active'}
                    className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border-2 ${
                      sortBy === 'most_active'
                        ? 'bg-primary-500 text-white border-primary-500 shadow-lg'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-md'
                    }`}
                  >
                    Most Active
                  </button>
                </div>
              </div>
              
              {/* Responsive Grid */}
              <div className="grid-cards-4">
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
              {/* No locals found - Show EmptyState */}
              <NoLocalsFound 
                location={searchParams.city || searchParams.location || 'this area'}
                onExplore={handleNewSearch}
                onChangeTags={handleChangeTags}
              />

              {/* Nearby cities banner */}
              {nearbyLoading || nearbyCities.length > 0 ? (
                <NearbyBanner
                  cities={nearbyCities}
                  loading={nearbyLoading}
                  onCityClick={handleNearbyCityClick}
                />
              ) : (
                <NoNearbyFound 
                  onExplore={handleNewSearch}
                  onHome={handleBackToHome}
                />
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}