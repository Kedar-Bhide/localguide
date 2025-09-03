import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import EditLocalProfile from '../components/profile/EditLocalProfile'
import ActiveChats from '../components/chat/ActiveChats'
import Button from '../components/ui/Button'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface LocalProfile {
  avatar_url?: string
  bio?: string
  city?: string
  country?: string
}

export default function Requests() {
  const { profile, loading } = useProfile()
  const { user } = useAuth()
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [localProfile, setLocalProfile] = useState<LocalProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Fetch local profile data to check completeness
  useEffect(() => {
    const fetchLocalProfile = async () => {
      if (!user?.id) return
      
      try {
        // Get user profile with avatar info
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        // Get local-specific profile data
        const { data: localData } = await supabase
          .from('locals')
          .select('bio, city, country')
          .eq('user_id', user.id)
          .single()

        setLocalProfile({
          avatar_url: userProfile?.avatar_url,
          bio: localData?.bio || '',
          city: localData?.city || '',
          country: localData?.country || ''
        })
      } catch (error) {
        console.error('Error fetching local profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    if (!loading && profile?.is_local && user) {
      fetchLocalProfile()
    } else if (!loading && profile && !profile.is_local) {
      router.push('/explore')
    } else if (!loading) {
      setProfileLoading(false)
    }
  }, [profile, loading, router, user])

  // Check if profile is incomplete (missing avatar or bio < 160 chars)
  const isProfileIncomplete = () => {
    if (!localProfile) return false
    
    const missingAvatar = !localProfile.avatar_url
    const shortBio = !localProfile.bio || localProfile.bio.length < 160
    
    return missingAvatar || shortBio
  }

  const handleProfileSaved = () => {
    // Refetch local profile data after save
    if (user?.id) {
      const fetchLocalProfile = async () => {
        try {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single()

          const { data: localData } = await supabase
            .from('locals')
            .select('bio, city, country')
            .eq('user_id', user.id)
            .single()

          setLocalProfile({
            avatar_url: userProfile?.avatar_url,
            bio: localData?.bio || '',
            city: localData?.city || '',
            country: localData?.country || ''
          })
        } catch (error) {
          console.error('Error refetching local profile:', error)
        }
      }
      fetchLocalProfile()
    }
  }

  if (loading || profileLoading) {
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
        <div className="container-grid">
          {/* Profile Completeness Banner */}
          {isProfileIncomplete() && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-amber-800 text-sm">
                    Complete your profile to help travelers choose you
                  </p>
                </div>
                <Button 
                  onClick={() => setShowEditModal(true)}
                  size="sm"
                  className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 focus:ring-amber-500"
                  variant="secondary"
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          )}

          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800 text-sm">
              💡 Reply promptly (within 24h) for best traveler experience.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h1 className="headline mb-4 sm:mb-0">Your Chat Requests</h1>
            <Button 
              onClick={() => setShowEditModal(true)}
              variant="secondary"
              className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
            >
              Edit Local Profile
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="subheading">
                  Welcome, {profile?.full_name}!
                </h2>
                <p className="body text-secondary-color">
                  Here you&apos;ll see travelers who want to connect with you for local recommendations.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="small">
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