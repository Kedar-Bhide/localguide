import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { useProfile } from '../hooks/useProfile'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Requests() {
  const { profile, loading } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile && !profile.is_local) {
      router.push('/explore')
    }
  }, [profile, loading, router])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (!profile?.is_local) {
    return null
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800 text-sm">
              💡 Reply promptly (within 24h) for best traveler experience.
            </p>
          </div>

          <h1 className="text-3xl font-bold mb-8">Your Chat Requests</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Welcome, {profile?.full_name}!
            </h2>
            <p className="text-gray-600 mb-4">
              Here you'll see travelers who want to connect with you for local recommendations.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <p className="text-gray-600 text-sm">
                🚧 Chat functionality coming soon! This page will show your active chats with travelers.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}