import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { searchLocalsRanked, findOrCreateChat } from '../utils/api'
import { getUser } from '../lib/supabase'
import type { LocalSearchResult } from '../types'

interface SearchParams {
  location?: string
  city?: string
  country?: string
  startDate?: string
  endDate?: string
  tags?: string[]
  searchId?: string
}

export default function ConnectWithLocals() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [locals, setLocals] = useState<LocalSearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

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

  const performSearch = async (city: string, country: string, tags: string[]) => {
    setSearchLoading(true)
    try {
      const results = await searchLocalsRanked(city, country, tags)
      setLocals(results)
    } catch (error) {
      console.error('Error searching locals:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleNewSearch = () => {
    router.push('/explore')
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
            <Card>
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">Searching for local experts...</span>
              </div>
            </Card>
          ) : locals.length > 0 ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Local Experts ({locals.length})</h2>
                <p className="text-gray-600">Ranked by relevance and activity</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {locals.map((local) => (
                  <Card key={local.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {local.user.avatar_url ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={local.user.avatar_url}
                            alt={local.user.full_name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-lg">
                              {local.user.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {local.user.full_name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {local.city}, {local.country}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-gray-700 text-sm line-clamp-3">{local.bio}</p>
                    </div>
                    
                    {local.tags && local.tags.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1">
                          {local.tags.slice(0, 4).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {local.tags.length > 4 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              +{local.tags.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <Button
                        onClick={() => handleConnect(local)}
                        variant="primary"
                        size="sm"
                        className="w-full"
                      >
                        Connect
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Local Experts Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any local experts matching your search criteria.
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
      </Layout>
    </ProtectedRoute>
  )
}