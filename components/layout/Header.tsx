import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { signOut } from '../../lib/supabase'
import { ROUTES } from '../../utils/constants'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import Button from '../ui/Button'

interface HeaderProps {
  showAuthButtons?: boolean
}

export default function Header({ showAuthButtons = true }: HeaderProps) {
  const { user } = useAuth()
  const { profile } = useProfile()
  const router = useRouter()

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

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <Link href={ROUTES.HOME} className="text-2xl font-bold text-blue-600">
              LocalGuide
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {showAuthButtons && !user && (
              <>
                <Link href={ROUTES.JOIN} className="text-gray-600 hover:text-gray-900">
                  Join
                </Link>
                <Link href={ROUTES.LOGIN} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Login
                </Link>
              </>
            )}
            
            {user && profile && (
              <div className="flex items-center space-x-4">
                {/* Local/Traveler toggle button */}
                {profile.is_local ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(ROUTES.EXPLORE)}
                  >
                    My Traveler Profile
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBecomeLocal}
                  >
                    Become a Local
                  </Button>
                )}

                {/* Profile dropdown */}
                <Dropdown
                  trigger={
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{profile.full_name}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  }
                >
                  {profile.is_local && (
                    <DropdownItem onClick={handleMyLocalProfile}>
                      My Local Profile
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={handleLogout}>
                    Logout
                  </DropdownItem>
                </Dropdown>
              </div>
            )}
            
            <Link href={ROUTES.FEEDBACK} className="text-gray-600 hover:text-gray-900">
              Feedback
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}