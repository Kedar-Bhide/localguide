import { ReactNode } from 'react'
import AppHeader from './AppHeader'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
  showAuthButtons?: boolean
}

export default function Layout({ 
  children, 
  showAuthButtons = true
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <AppHeader showAuthButtons={showAuthButtons} />
      <main className="section-spacing flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}