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
    <div className="min-h-screen bg-[color:var(--bg-soft)]">
      <Header showAuthButtons={showAuthButtons} />
      <main className="section-spacing">
        {children}
      </main>
    </div>
  )
}