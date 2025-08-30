import Link from 'next/link'
import { ROUTES } from '../../utils/constants'

interface HeaderProps {
  isAuthenticated?: boolean
  showAuthButtons?: boolean
  showProfile?: boolean
}

export default function Header({ isAuthenticated = false, showAuthButtons = true, showProfile = false }: HeaderProps) {
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
            {showAuthButtons && !isAuthenticated && (
              <>
                <Link href={ROUTES.JOIN} className="text-gray-600 hover:text-gray-900">
                  Join
                </Link>
                <Link href={ROUTES.LOGIN} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Login
                </Link>
              </>
            )}
            
            {showProfile && isAuthenticated && (
              <div className="flex items-center space-x-4">
                {/* Profile dropdown will be implemented here */}
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