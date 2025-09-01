import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { signOut, supabase } from '../../lib/supabase'
import { ROUTES } from '../../utils/constants'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import Button from '../ui/Button'
import ProfileModal from '../profile/ProfileModal'
import AvatarUpload from '../profile/AvatarUpload'
import { User, MessageSquare, LogOut, ChevronDown } from 'lucide-react'

interface HeaderProps {
  showAuthButtons?: boolean
}

export default function Header({ showAuthButtons = true }: HeaderProps) {
  const { user } = useAuth()
  const { profile } = useProfile()
  const router = useRouter()
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push(ROUTES.HOME)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleBecomeLocal = () => {
    router.push(ROUTES.BECOME_A_LOCAL)
  }

  const handleMyLocalProfile = () => {
    router.push(ROUTES.REQUESTS)
  }

  // Load avatar URL when profile changes
  React.useEffect(() => {
    if (profile?.avatar_url) {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(profile.avatar_url)
      setAvatarUrl(data.publicUrl)
    } else {
      setAvatarUrl(null)
    }
  }, [profile?.avatar_url])

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[color:var(--border)] z-40">
      <div className="max-w-7xl mx-auto section-gutter">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div>
            <Link href={ROUTES.HOME} className="text-2xl font-bold text-[color:var(--brand)] hover:text-[color:var(--brand-600)] transition-colors">
              LocalGuide
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {showAuthButtons && !user && (
              <>
                <Link href={ROUTES.JOIN} className="text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] transition-colors text-sm font-medium">
                  Join
                </Link>
                <Link href={ROUTES.LOGIN} className="btn-brand">
                  Login
                </Link>
              </>
            )}
            
            {user && profile && (
              <div className="flex items-center space-x-4">
                {/* Local/Traveler toggle button */}
                {profile.is_local ? (
                  <button
                    onClick={() => router.push(ROUTES.EXPLORE)}
                    className="btn-secondary text-sm"
                  >
                    My Traveler Profile
                  </button>
                ) : (
                  <button
                    onClick={handleBecomeLocal}
                    className="btn-secondary text-sm"
                  >
                    Become a Local
                  </button>
                )}

                {/* Profile dropdown */}
                <Dropdown
                  trigger={
                    <button className="flex items-center space-x-2 text-[color:var(--ink)] hover:text-[color:var(--brand)] transition-colors p-2 rounded-xl hover:bg-[color:var(--bg-soft)]">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${profile.full_name} avatar`}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-[color:var(--border)]"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-[color:var(--brand)] text-white rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium hidden sm:block">{profile.full_name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  }
                >
                  <DropdownItem onClick={() => setProfileModalOpen(true)}>
                    <User className="w-4 h-4" />
                    Profile Settings
                  </DropdownItem>
                  {profile.is_local && (
                    <DropdownItem onClick={handleMyLocalProfile}>
                      <MessageSquare className="w-4 h-4" />
                      My Local Profile
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownItem>
                </Dropdown>
              </div>
            )}
            
            <Link href={ROUTES.FEEDBACK} className="text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] transition-colors text-sm font-medium">
              Feedback
            </Link>
          </div>
        </div>
      </div>
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </header>
  )
}