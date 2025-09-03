import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import SearchContainer from '../components/search/SearchContainer'
import ActiveChats from '../components/chat/ActiveChats'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { saveSearch, buildSearchParams } from '../utils/search'

export default function Explore() {
  const { profile, loading } = useProfile()
  const { user } = useAuth()
  const router = useRouter()

  const handleSearch = async (searchData: any) => {
    if (!user) {
      console.error('User not authenticated')
      return
    }

    try {
      // Save search to database
      const searchId = await saveSearch(searchData, user.id)
      
      // Build search parameters
      const searchParams = buildSearchParams(searchData, searchId)
      
      // Navigate to connect-with-locals page with search data
      router.push(`/connect-with-locals?${searchParams}`)
    } catch (error) {
      console.error('Failed to save search:', error)
      // Still navigate even if saving fails
      const searchParams = buildSearchParams(searchData)
      router.push(`/connect-with-locals?${searchParams}`)
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
        {/* Search Container - compact sticky bar */}
        <SearchContainer />
        
        <div className="max-w-7xl mx-auto section-gutter">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h1 className="headline">
                  Explore Local Destinations
                </h1>
                <h2 className="subheading">
                  Welcome back, {profile?.full_name}!
                </h2>
                <p className="body text-secondary-color">
                  Use the search above to find locals in your destination city and connect with them to discover hidden gems.
                </p>
              </div>

              {/* Placeholder for search results */}
              <div className="card p-6 bg-[color:var(--brand)]/5 border-[color:var(--brand)]/20">
                <p className="small text-brand-color">
                  🚧 Search results and local profiles will appear here after you search!
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ActiveChats />
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}