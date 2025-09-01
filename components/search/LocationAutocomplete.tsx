import React, { useState, useEffect, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { MapPin, Navigation, Clock, X, Search } from 'lucide-react'
import { LocationSuggestion } from '../../types/search'
import { useRecentSearches, RecentSearch } from '../../utils/recentSearches'
import { useIsMobile } from '../../hooks/useMediaQuery'

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect: (location: string) => void
  placeholder?: string
  className?: string
}

export default function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = 'Where are you going?',
  className = ''
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeDescendant, setActiveDescendant] = useState<string | undefined>(undefined)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  
  const { getRecentSearches, addRecentSearch, removeRecentSearch } = useRecentSearches()
  
  // Generate stable IDs for ARIA
  const comboboxId = useId()
  const listboxId = useId()
  const getCurrentLocationId = useId()

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  // Mock location suggestions (in real app, use Google Places API)
  const getMockSuggestions = (query: string): LocationSuggestion[] => {
    if (!query) return []
    
    const mockLocations = [
      { place_id: '1', description: 'New York, NY, USA', main_text: 'New York', secondary_text: 'NY, USA' },
      { place_id: '2', description: 'New York City, NY, USA', main_text: 'New York City', secondary_text: 'NY, USA' },
      { place_id: '3', description: 'Newark, NJ, USA', main_text: 'Newark', secondary_text: 'NJ, USA' },
      { place_id: '4', description: 'Los Angeles, CA, USA', main_text: 'Los Angeles', secondary_text: 'CA, USA' },
      { place_id: '5', description: 'San Francisco, CA, USA', main_text: 'San Francisco', secondary_text: 'CA, USA' },
      { place_id: '6', description: 'London, England, UK', main_text: 'London', secondary_text: 'England, UK' },
      { place_id: '7', description: 'Paris, France', main_text: 'Paris', secondary_text: 'France' },
      { place_id: '8', description: 'Tokyo, Japan', main_text: 'Tokyo', secondary_text: 'Japan' },
      { place_id: '9', description: 'Berlin, Germany', main_text: 'Berlin', secondary_text: 'Germany' },
      { place_id: '10', description: 'Sydney, Australia', main_text: 'Sydney', secondary_text: 'Australia' },
    ]
    
    return mockLocations.filter(location =>
      location.description.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8)
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        const newSuggestions = getMockSuggestions(value)
        setSuggestions(newSuggestions)
      } else {
        setSuggestions([])
      }
    }, 150)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value])

  // Calculate total items for keyboard navigation
  const getTotalItems = () => {
    let total = 1 // Current location option
    if (value) {
      total += suggestions.length
    } else {
      total += recentSearches.length
    }
    return total
  }

  // Generate item ID for ARIA
  const getItemId = (index: number): string => {
    if (index === -1) return getCurrentLocationId
    return `${listboxId}-option-${index}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)
    setActiveDescendant(getCurrentLocationId)
    setIsOpen(true)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    setSelectedIndex(-1)
    setActiveDescendant(getCurrentLocationId)
  }

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if focus moved to an option
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setTimeout(() => {
        setIsOpen(false)
        setActiveDescendant(undefined)
      }, 150)
    }
  }

  const handleLocationClick = (location: string) => {
    onChange(location)
    onLocationSelect(location)
    addRecentSearch(location)
    setRecentSearches(getRecentSearches())
    setIsOpen(false)
    setActiveDescendant(undefined)
    inputRef.current?.blur()
  }

  const handleCurrentLocationClick = () => {
    const location = 'Current location'
    handleLocationClick(location)
  }

  const handleRemoveRecent = (searchId: string) => {
    removeRecentSearch(searchId)
    setRecentSearches(getRecentSearches())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = getTotalItems()

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        const nextIndex = selectedIndex < totalItems - 1 ? selectedIndex + 1 : -1
        setSelectedIndex(nextIndex)
        setActiveDescendant(getItemId(nextIndex))
        break

      case 'ArrowUp':
        e.preventDefault()
        const prevIndex = selectedIndex <= -1 ? totalItems - 1 : selectedIndex - 1
        setSelectedIndex(prevIndex)
        setActiveDescendant(getItemId(prevIndex))
        break

      case 'Enter':
        e.preventDefault()
        if (selectedIndex === -1) {
          handleCurrentLocationClick()
        } else if (value) {
          if (selectedIndex < suggestions.length) {
            handleLocationClick(suggestions[selectedIndex].description)
          }
        } else {
          if (selectedIndex < recentSearches.length) {
            handleLocationClick(recentSearches[selectedIndex].location)
          }
        }
        break

      case 'Escape':
        setIsOpen(false)
        setActiveDescendant(undefined)
        inputRef.current?.blur()
        break

      case 'Tab':
        setIsOpen(false)
        setActiveDescendant(undefined)
        break
    }
  }

  // Desktop popover content
  const DesktopPopover = () => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-soft border border-[color:var(--border)] overflow-hidden z-50 max-h-80 overflow-y-auto"
          role="listbox"
          id={listboxId}
          aria-label="Location suggestions"
        >
          <PopoverContent />
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Mobile sheet content
  const MobileSheet = () => (
    <Dialog.Root open={isOpen && isMobile} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-hidden"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between p-6 border-b border-[color:var(--border)]">
              <h3 className="text-lg font-semibold text-[color:var(--ink)]">
                Where to?
              </h3>
              <Dialog.Close asChild>
                <button 
                  className="p-2 text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] hover:bg-[color:var(--bg-soft)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                  aria-label="Close location search"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Mobile Search Input */}
            <div className="p-6 border-b border-[color:var(--border)]">
              <div className="relative">
                <input
                  type="text"
                  value={value}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  className="input text-lg py-4 pl-12 pr-4 w-full border-2 border-[color:var(--border)] focus:border-[color:var(--brand)] rounded-2xl"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted-ink)]" />
              </div>
            </div>

            {/* Mobile Content */}
            <div 
              className="flex-1 overflow-y-auto"
              role="listbox"
              id={listboxId}
              aria-label="Location suggestions"
            >
              <PopoverContent />
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

  // Shared popover content
  const PopoverContent = () => (
    <>
      {/* Current Location Option */}
      <button
        id={getCurrentLocationId}
        onClick={handleCurrentLocationClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-[color:var(--bg-soft)] transition-colors focus:outline-none focus:bg-[color:var(--bg-soft)] ${
          selectedIndex === -1 ? 'bg-[color:var(--bg-soft)]' : ''
        }`}
        role="option"
        aria-selected={selectedIndex === -1}
      >
        <Navigation className="w-5 h-5 text-[color:var(--brand)]" />
        <span className="text-[color:var(--brand)] font-medium">
          Use current location
        </span>
      </button>

      <div className="border-t border-[color:var(--border)]" />

      {value ? (
        /* Location Suggestions */
        <div>
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                id={getItemId(index)}
                onClick={() => handleLocationClick(suggestion.description)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-[color:var(--bg-soft)] transition-colors focus:outline-none focus:bg-[color:var(--bg-soft)] ${
                  index === selectedIndex ? 'bg-[color:var(--bg-soft)]' : ''
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <MapPin className="w-5 h-5 text-[color:var(--muted-ink)]" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[color:var(--ink)]">
                    {suggestion.main_text}
                  </div>
                  <div className="text-sm text-[color:var(--muted-ink)] truncate">
                    {suggestion.secondary_text}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-[color:var(--muted-ink)] text-center">
              No locations found for "{value}"
            </div>
          )}
        </div>
      ) : (
        /* Recent Searches */
        <div>
          {recentSearches.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-medium text-[color:var(--muted-ink)] bg-[color:var(--bg-soft)] flex items-center justify-between">
                <span>Recent searches</span>
                {recentSearches.length > 0 && (
                  <button
                    onClick={() => {
                      recentSearches.forEach(search => removeRecentSearch(search.id))
                      setRecentSearches([])
                    }}
                    className="text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] underline focus:outline-none"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={search.id}
                  className={`group flex items-center space-x-3 px-4 py-3 hover:bg-[color:var(--bg-soft)] ${
                    index === selectedIndex ? 'bg-[color:var(--bg-soft)]' : ''
                  }`}
                >
                  <button
                    id={getItemId(index)}
                    onClick={() => handleLocationClick(search.location)}
                    className="flex-1 flex items-center space-x-3 text-left focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 rounded"
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <Clock className="w-5 h-5 text-[color:var(--muted-ink)]" />
                    <span className="text-[color:var(--ink)]">{search.location}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveRecent(search.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[color:var(--muted-ink)] hover:text-[color:var(--error)] rounded transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                    aria-label={`Remove ${search.location} from recent searches`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </>
          )}
          
          {recentSearches.length === 0 && (
            <div className="px-4 py-8 text-[color:var(--muted-ink)] text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent searches</p>
              <p className="text-xs mt-1">Search for a location to see it here</p>
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input text-lg py-4 pl-12 pr-4 w-full border-2 border-[color:var(--border)] focus:border-[color:var(--brand)] rounded-2xl"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-describedby={`${comboboxId}-description`}
          id={comboboxId}
        />
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted-ink)]" />
        
        {/* Screen reader description */}
        <div id={`${comboboxId}-description`} className="sr-only">
          Use arrow keys to navigate suggestions, press Enter to select, press Escape to close.
        </div>
      </div>

      {/* Desktop Popover */}
      {!isMobile && <DesktopPopover />}
      
      {/* Mobile Sheet */}
      {isMobile && <MobileSheet />}
    </div>
  )
}