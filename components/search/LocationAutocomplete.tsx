import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Clock } from 'lucide-react'
import { LocationSuggestion } from '../../types/search'

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
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches] = useState<string[]>([
    'New York, NY',
    'Los Angeles, CA',
    'London, UK',
    'Paris, France'
  ])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

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
    ]
    
    return mockLocations.filter(location =>
      location.description.toLowerCase().includes(query.toLowerCase())
    )
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        const newSuggestions = getMockSuggestions(value)
        setSuggestions(newSuggestions)
        setIsOpen(true)
      } else {
        setSuggestions([])
        setIsOpen(value.length === 0) // Show recent searches when empty
      }
    }, 150)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => setIsOpen(false), 150)
  }

  const handleSuggestionClick = (location: string) => {
    onChange(location)
    onLocationSelect(location)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = value ? suggestions.length : recentSearches.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        const selectedLocation = value 
          ? suggestions[selectedIndex]?.description
          : recentSearches[selectedIndex]
        
        if (selectedLocation) {
          handleSuggestionClick(selectedLocation)
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const getCurrentLocationText = () => "Use current location"

  return (
    <div className={`relative ${className}`}>
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
        />
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted-ink)]" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-[color:var(--border)] overflow-hidden z-50"
          >
            {/* Current Location Option */}
            <button
              onClick={() => handleSuggestionClick(getCurrentLocationText())}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-[color:var(--bg-soft)] transition-colors focus:outline-none focus:bg-[color:var(--bg-soft)] ${
                selectedIndex === -1 ? 'bg-[color:var(--bg-soft)]' : ''
              }`}
            >
              <Navigation className="w-5 h-5 text-[color:var(--brand)]" />
              <span className="text-[color:var(--brand)] font-medium">
                {getCurrentLocationText()}
              </span>
            </button>

            <div className="border-t border-[color:var(--border)]" />

            {value ? (
              /* Location Suggestions */
              <div className="max-h-64 overflow-y-auto">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionClick(suggestion.description)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-[color:var(--bg-soft)] transition-colors focus:outline-none focus:bg-[color:var(--bg-soft)] ${
                        index === selectedIndex ? 'bg-[color:var(--bg-soft)]' : ''
                      }`}
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
                  <div className="px-4 py-3 text-[color:var(--muted-ink)] text-center">
                    No locations found
                  </div>
                )}
              </div>
            ) : (
              /* Recent Searches */
              <div>
                <div className="px-4 py-2 text-xs font-medium text-[color:var(--muted-ink)] bg-[color:var(--bg-soft)]">
                  Recent searches
                </div>
                {recentSearches.map((location, index) => (
                  <button
                    key={location}
                    onClick={() => handleSuggestionClick(location)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-[color:var(--bg-soft)] transition-colors focus:outline-none focus:bg-[color:var(--bg-soft)] ${
                      index === selectedIndex ? 'bg-[color:var(--bg-soft)]' : ''
                    }`}
                  >
                    <Clock className="w-5 h-5 text-[color:var(--muted-ink)]" />
                    <span className="text-[color:var(--ink)]">{location}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}