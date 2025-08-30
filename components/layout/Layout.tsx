import { ReactNode } from 'react'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
  showAuthButtons?: boolean
}

export default function Layout({ 
  children, 
  showAuthButtons = true
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showAuthButtons={showAuthButtons} />
      <main className="py-8">
        {children}
      </main>
    </div>
  )
}