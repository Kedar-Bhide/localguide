import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { SearchFilters } from '../types/search'

export function useSearchParams() {
  const router = useRouter()
  const [filters, setFilters] = useState<SearchFilters>({})
  const [isReady, setIsReady] = useState(false)

  // Parse URL params to filters
  const parseFiltersFromUrl = (): SearchFilters => {
    const { query } = router
    
    return {
      location: query.location as string || undefined,
      startDate: query.startDate as string || undefined,
      endDate: query.endDate as string || undefined,
      tags: query.tags ? (query.tags as string).split(',').filter(Boolean) : undefined
    }
  }

  // Update URL params from filters
  const updateUrlFromFilters = (newFilters: SearchFilters) => {
    const params = new URLSearchParams()
    
    if (newFilters.location) params.set('location', newFilters.location)
    if (newFilters.startDate) params.set('startDate', newFilters.startDate)
    if (newFilters.endDate) params.set('endDate', newFilters.endDate)
    if (newFilters.tags && newFilters.tags.length > 0) {
      params.set('tags', newFilters.tags.join(','))
    }

    const queryString = params.toString()
    const newUrl = `${router.pathname}${queryString ? `?${queryString}` : ''}`
    
    // Update URL without causing a navigation
    router.replace(newUrl, undefined, { shallow: true })
  }

  // Initialize filters from URL on mount
  useEffect(() => {
    if (router.isReady) {
      const urlFilters = parseFiltersFromUrl()
      setFilters(urlFilters)
      setIsReady(true)
    }
  }, [router.isReady])

  // Update filters and sync to URL
  const updateFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    updateUrlFromFilters(newFilters)
  }

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters: SearchFilters = {}
    setFilters(emptyFilters)
    updateUrlFromFilters(emptyFilters)
  }

  return {
    filters,
    updateFilters,
    clearFilters,
    isReady
  }
}