import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { SearchFilters } from '../../types/search'
import BottomSheet from '../ui/BottomSheet'
import { useIsMobile } from '../../hooks/useMediaQuery'

// Dynamically import heavy components
const LocationAutocomplete = dynamic(() => import('./LocationAutocomplete'), {
  loading: () => <div className="animate-pulse h-12 bg-gray-200 rounded-lg" />,
  ssr: false
})

const DateRangePicker = dynamic(() => import('./DateRangePicker'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />,
  ssr: false
})

const TagsMultiSelect = dynamic(() => import('./TagsMultiSelect'), {
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />,
  ssr: false
})

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  activeTab?: string
  onTabChange: (tab: string) => void
}

export default function SearchOverlay({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  activeTab = 'where',
  onTabChange
}: SearchOverlayProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const tabs = [
    { id: 'where', label: 'Where', isComplete: !!localFilters.location },
    { id: 'dates', label: 'When', isComplete: !!localFilters.startDate },
    { id: 'interests', label: 'What', isComplete: !!localFilters.tags && localFilters.tags.length > 0 }
  ]

  const handleLocationChange = (location: string) => {
    const newFilters = { ...localFilters, location }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleLocationSelect = (location: string) => {
    const newFilters = { ...localFilters, location }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
    // Move to next tab after selection
    onTabChange('dates')
  }

  const handleDateRangeChange = (startDate: string | undefined, endDate: string | undefined) => {
    const newFilters = { ...localFilters, startDate, endDate }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleTagsChange = (tags: string[]) => {
    const newFilters = { ...localFilters, tags }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearch = () => {
    // Navigate to search results
    if (localFilters.location) {
      const params = new URLSearchParams()
      if (localFilters.location) params.set('location', localFilters.location)
      if (localFilters.startDate) params.set('startDate', localFilters.startDate)
      if (localFilters.endDate) params.set('endDate', localFilters.endDate)
      if (localFilters.tags && localFilters.tags.length > 0) {
        params.set('tags', localFilters.tags.join(','))
      }
      
      router.push(`/connect-with-locals?${params.toString()}`)
      onClose()
    }
  }

  const handleClearAll = () => {
    const clearedFilters: SearchFilters = {}
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasAnyFilters = !!(
    localFilters.location ||
    localFilters.startDate ||
    localFilters.endDate ||
    (localFilters.tags && localFilters.tags.length > 0)
  )

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const renderContent = () => (
    <>
      {/* Tab Navigation */}
      <div className="flex border-b border-[color:var(--border)] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 min-h-[44px] ${
              activeTab === tab.id
                ? 'border-[color:var(--brand)] text-[color:var(--brand)]'
                : 'border-transparent text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] hover:border-[color:var(--border)]'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>{tab.label}</span>
              {tab.isComplete && (
                <div className="w-2 h-2 bg-[color:var(--brand)] rounded-full" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'where' && (
          <div className="mb-6">
            <LocationAutocomplete
              value={localFilters.location || ''}
              onChange={handleLocationChange}
              onLocationSelect={handleLocationSelect}
              placeholder="Where do you want to explore?"
            />
          </div>
        )}

        {activeTab === 'dates' && (
          <DateRangePicker
            startDate={localFilters.startDate}
            endDate={localFilters.endDate}
            onDateRangeChange={handleDateRangeChange}
            isOpen={true}
          />
        )}

        {activeTab === 'interests' && (
          <TagsMultiSelect
            selectedTags={localFilters.tags || []}
            onTagsChange={handleTagsChange}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 mt-6">
        {hasAnyFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] underline focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 rounded p-2 min-h-[44px]"
          >
            Clear all
          </button>
        )}
        
        <button
          onClick={handleSearch}
          disabled={!localFilters.location}
          className={`flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] ${
            localFilters.location
              ? 'bg-[color:var(--brand)] text-white hover:bg-[color:var(--brand-600)] focus:ring-[color:var(--brand)] hover:scale-105 active:scale-95'
              : 'bg-[color:var(--border)] text-[color:var(--muted-ink)] cursor-not-allowed'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </div>
    </>
  )

  // Mobile bottom sheet
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title="Search LocalGuide"
        maxHeight="85vh"
      >
        {renderContent()}
      </BottomSheet>
    )
  }

  // Desktop overlay
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-3xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[color:var(--border)] flex-shrink-0">
              <h2 className="text-2xl font-semibold text-[color:var(--ink)]">
                Search LocalGuide
              </h2>
              
              <button
                onClick={onClose}
                className="p-2 text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] hover:bg-[color:var(--bg-soft)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close search"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-6">
              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}