import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { useProfile } from '../hooks/useProfile'

export default function Explore() {
  const { profile, loading } = useProfile()

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
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Explore Local Destinations</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Welcome back, {profile?.full_name}!
            </h2>
            <p className="text-gray-600 mb-4">
              Search for locals in your destination city and connect with them to discover hidden gems.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800 text-sm">
                🚧 Search functionality coming soon! This page will allow you to search for locals by city and interests.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}