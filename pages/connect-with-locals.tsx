import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

interface SearchParams {
  location?: string
  startDate?: string
  endDate?: string
  tags?: string[]
  searchId?: string
}

export default function ConnectWithLocals() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (router.isReady) {
      const { location, startDate, endDate, tags, searchId } = router.query
      
      setSearchParams({
        location: location as string || '',
        startDate: startDate as string || '',
        endDate: endDate as string || '',
        tags: tags ? (tags as string).split(',') : [],
        searchId: searchId as string || ''
      })
      
      setLoading(false)
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

  const handleNewSearch = () => {
    router.push('/explore')
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

          {/* Placeholder for search results */}
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Finding Local Experts</h3>
              <p className="text-gray-600 mb-6">
                Local profiles and search results will be displayed here in a future milestone. 
                Your search has been saved and logged successfully!
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Search Saved Successfully
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Your search has been logged{searchParams.searchId && ` (ID: ${searchParams.searchId.slice(0, 8)}...)`} and we'll use it to show you the most relevant local experts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-x-4">
                <Button onClick={handleNewSearch} variant="outline">
                  Search Again
                </Button>
                <Button onClick={() => router.push('/home')} variant="primary">
                  Back to Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}