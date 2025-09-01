import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Tag } from 'lucide-react'
import { useRouter } from 'next/router'
import { SearchFilters, SearchSegment } from '../../types/search'

interface SearchBarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onOpenOverlay: (segment?: string) => void
  className?: string
}

export default function SearchBar({ 
  filters, 
  onFiltersChange, 
  onOpenOverlay,
  className = ''
}: SearchBarProps) {
  const router = useRouter()
  
  // Format display values
  const getDateDisplay = () => {
    if (!filters.startDate && !filters.endDate) return ''
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      const end = new Date(filters.endDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      return `${start} - ${end}`
    }
    if (filters.startDate) {
      return new Date(filters.startDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
    return ''
  }

  const getTagsDisplay = () => {
    if (!filters.tags || filters.tags.length === 0) return ''
    if (filters.tags.length === 1) return filters.tags[0]
    return `${filters.tags[0]} +${filters.tags.length - 1}`
  }

  const segments: SearchSegment[] = [
    {
      id: 'where',
      label: 'Where',
      placeholder: 'Search destinations',
      value: filters.location,
      isEmpty: !filters.location
    },
    {
      id: 'dates',
      label: 'Dates',
      placeholder: 'Add dates',
      value: getDateDisplay(),
      isEmpty: !filters.startDate && !filters.endDate
    },
    {
      id: 'interests',
      label: 'Interests',
      placeholder: 'Add interests',
      value: getTagsDisplay(),
      isEmpty: !filters.tags || filters.tags.length === 0
    }
  ]

  const handleSegmentClick = (segmentId: string) => {
    onOpenOverlay(segmentId)
  }

  const handleSearchClick = () => {
    // Navigate to search results if we have a location
    if (filters.location) {
      const params = new URLSearchParams()
      if (filters.location) params.set('location', filters.location)
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)
      if (filters.tags && filters.tags.length > 0) {
        params.set('tags', filters.tags.join(','))
      }
      
      router.push(`/connect-with-locals?${params.toString()}`)
    } else {
      // Open the overlay with the where segment focused
      onOpenOverlay('where')
    }
  }

  return (
    <motion.div
      className={`sticky top-20 z-30 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="max-w-4xl mx-auto section-gutter">
        <div className="card p-2 bg-white shadow-soft">
          <div className="flex items-center">
            {/* Search Segments */}
            <div className="flex-1 flex">
              {segments.map((segment, index) => (
                <React.Fragment key={segment.id}>
                  <button
                    onClick={() => handleSegmentClick(segment.id)}
                    className="flex-1 min-w-0 p-3 text-left hover:bg-[color:var(--bg-soft)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {segment.id === 'where' && (
                          <MapPin className="w-4 h-4 text-[color:var(--muted-ink)]" />
                        )}
                        {segment.id === 'dates' && (
                          <Calendar className="w-4 h-4 text-[color:var(--muted-ink)]" />
                        )}
                        {segment.id === 'interests' && (
                          <Tag className="w-4 h-4 text-[color:var(--muted-ink)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-[color:var(--ink)] mb-1">
                          {segment.label}
                        </div>
                        <div className={`text-sm truncate ${
                          segment.isEmpty
                            ? 'text-[color:var(--muted-ink)]'
                            : 'text-[color:var(--ink)] font-medium'
                        }`}>
                          {segment.value || segment.placeholder}
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {index < segments.length - 1 && (
                    <div className="w-px bg-[color:var(--border)] mx-1" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearchClick}
              className="ml-3 btn-brand p-3 aspect-square flex items-center justify-center focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}