import { useAuth } from '../hooks/useAuth'

const MAX_RECENT_SEARCHES = 5
const STORAGE_KEY_PREFIX = 'localguide_recent_locations_'

export interface RecentSearch {
  id: string
  location: string
  timestamp: number
}

export class RecentSearchManager {
  private userId: string | null

  constructor(userId: string | null) {
    this.userId = userId
  }

  private getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.userId || 'anonymous'}`
  }

  getRecentSearches(): RecentSearch[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.getStorageKey())
      if (!stored) return []
      
      const searches: RecentSearch[] = JSON.parse(stored)
      
      // Sort by timestamp (most recent first)
      return searches.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('Error reading recent searches from localStorage:', error)
      return []
    }
  }

  addRecentSearch(location: string): void {
    if (typeof window === 'undefined' || !location.trim()) return

    try {
      const existing = this.getRecentSearches()
      
      // Remove if already exists (to avoid duplicates and move to top)
      const filtered = existing.filter(search => 
        search.location.toLowerCase() !== location.toLowerCase()
      )
      
      // Add new search at the beginning
      const newSearch: RecentSearch = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        location: location.trim(),
        timestamp: Date.now()
      }
      
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      
      localStorage.setItem(this.getStorageKey(), JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving recent search to localStorage:', error)
    }
  }

  removeRecentSearch(searchId: string): void {
    if (typeof window === 'undefined') return

    try {
      const existing = this.getRecentSearches()
      const filtered = existing.filter(search => search.id !== searchId)
      localStorage.setItem(this.getStorageKey(), JSON.stringify(filtered))
    } catch (error) {
      console.error('Error removing recent search from localStorage:', error)
    }
  }

  clearAllRecentSearches(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.getStorageKey())
    } catch (error) {
      console.error('Error clearing recent searches from localStorage:', error)
    }
  }
}

// Hook to use recent searches manager
export function useRecentSearches() {
  const { user } = useAuth()
  const manager = new RecentSearchManager(user?.id || null)
  
  return {
    getRecentSearches: () => manager.getRecentSearches(),
    addRecentSearch: (location: string) => manager.addRecentSearch(location),
    removeRecentSearch: (searchId: string) => manager.removeRecentSearch(searchId),
    clearAllRecentSearches: () => manager.clearAllRecentSearches()
  }
}