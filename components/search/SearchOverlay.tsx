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
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const renderContent = () => (
    <>
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-6 py-4 text-base font-semibold border-b-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[56px] hover:bg-neutral-50 rounded-t-2xl ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>{tab.label}</span>
              {tab.isComplete && (
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
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
      <div className="flex flex-col space-y-4 mt-8">
        {hasAnyFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm text-neutral-600 hover:text-neutral-800 font-medium underline underline-offset-4 decoration-2 hover:decoration-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl p-3 min-h-[48px] transition-all duration-200 hover:bg-neutral-50"
          >
            Clear all filters
          </button>
        )}
        
        <button
          onClick={handleSearch}
          disabled={!localFilters.location}
          className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[56px] shadow-lg ${
            localFilters.location
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 hover:scale-105 hover:shadow-xl active:scale-95 transform'
              : 'bg-neutral-200 text-neutral-500 cursor-not-allowed shadow-none'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>{localFilters.location ? 'Find Local Experts' : 'Enter Destination'}</span>
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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-3xl shadow-2xl border border-neutral-100 z-50 flex flex-col max-h-[90vh] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-neutral-200 flex-shrink-0 bg-gradient-to-r from-neutral-50 to-white rounded-t-3xl">
              <h2 className="text-3xl font-bold text-neutral-900">
                Find Your Perfect Local Guide
              </h2>
              
              <button
                onClick={onClose}
                className="p-3 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[48px] min-w-[48px] flex items-center justify-center hover:scale-110 active:scale-95"
                aria-label="Close search"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-8">
              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}