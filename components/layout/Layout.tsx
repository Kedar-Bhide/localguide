import { ReactNode } from 'react'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
  isAuthenticated?: boolean
  showAuthButtons?: boolean
  showProfile?: boolean
}

export default function Layout({ 
  children, 
  isAuthenticated = false, 
  showAuthButtons = true, 
  showProfile = false 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isAuthenticated={isAuthenticated}
        showAuthButtons={showAuthButtons}
        showProfile={showProfile}
      />
      <main className="py-8">
        {children}
      </main>
    </div>
  )
}