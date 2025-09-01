import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import EditLocalProfile from '../components/profile/EditLocalProfile'
import ActiveChats from '../components/chat/ActiveChats'
import Button from '../components/ui/Button'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Requests() {
  const { profile, loading } = useProfile()
  const { user } = useAuth()
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (!loading && profile && !profile.is_local) {
      router.push('/explore')
    }
  }, [profile, loading, router])

  const handleProfileSaved = () => {
    // Profile has been updated successfully
    console.log('Local profile updated successfully')
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h1 className="text-3xl font-bold mb-4 sm:mb-0">Your Chat Requests</h1>
            <Button 
              onClick={() => setShowEditModal(true)}
              variant="outline"
              className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
            >
              Edit Local Profile
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Welcome, {profile?.full_name}!
                </h2>
                <p className="text-gray-600 mb-4">
                  Here you'll see travelers who want to connect with you for local recommendations.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-gray-600 text-sm">
                    🚧 Additional features coming soon! For now, check your active chats in the sidebar.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ActiveChats />
            </div>
          </div>
        </div>

        {/* Edit Local Profile Modal */}
        {user && (
          <EditLocalProfile
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleProfileSaved}
            userId={user.id}
          />
        )}
      </Layout>
    </ProtectedRoute>
  )
}