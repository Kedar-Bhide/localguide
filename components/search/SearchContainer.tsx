import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import SearchBar from './SearchBar'
import { useSearchParams } from '../../hooks/useSearchParams'

// Dynamically import SearchOverlay only when needed
const SearchOverlay = dynamic(() => import('./SearchOverlay'), {
  loading: () => <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />,
  ssr: false
})

interface SearchContainerProps {
  isHomePage?: boolean
  className?: string
}

export default function SearchContainer({ 
  isHomePage = false, 
  className = '' 
}: SearchContainerProps) {
  const router = useRouter()
  const { filters, updateFilters, isReady } = useSearchParams()
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('where')
  const [hasScrolled, setHasScrolled] = useState(false)

  // Handle scroll behavior for home page
  useEffect(() => {
    if (isHomePage) {
      const handleScroll = () => {
        const scrolled = window.scrollY > 100
        setHasScrolled(scrolled)
        
        // Auto-close overlay on scroll if on home page
        if (scrolled && isOverlayOpen) {
          setIsOverlayOpen(false)
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isHomePage, isOverlayOpen])

  // Auto-open overlay on home page by default (unless scrolled)
  useEffect(() => {
    if (isHomePage && isReady && !hasScrolled) {
      // Only open if no existing search in progress
      const hasFilters = !!(
        filters.location ||
        filters.startDate ||
        filters.endDate ||
        (filters.tags && filters.tags.length > 0)
      )
      
      if (!hasFilters) {
        setIsOverlayOpen(true)
      }
    }
  }, [isHomePage, isReady, hasScrolled, filters])

  const handleOpenOverlay = (segment?: string) => {
    if (segment) {
      setActiveTab(segment)
    }
    setIsOverlayOpen(true)
  }

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  // Don't render until router is ready
  if (!isReady) {
    return null
  }

  // On home page, show overlay expanded by default or compact bar when scrolled
  if (isHomePage) {
    return (
      <div className={className}>
        {hasScrolled && (
          <SearchBar
            filters={filters}
            onFiltersChange={updateFilters}
            onOpenOverlay={handleOpenOverlay}
          />
        )}
        
        <SearchOverlay
          isOpen={isOverlayOpen}
          onClose={handleCloseOverlay}
          filters={filters}
          onFiltersChange={updateFilters}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    )
  }

  // On other pages, always show compact bar
  return (
    <div className={className}>
      <SearchBar
        filters={filters}
        onFiltersChange={updateFilters}
        onOpenOverlay={handleOpenOverlay}
      />
      
      <SearchOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        filters={filters}
        onFiltersChange={updateFilters}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  )
}