import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'

interface TagsMultiSelectProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  maxTags?: number
  className?: string
}

export default function TagsMultiSelect({
  selectedTags,
  onTagsChange,
  maxTags = 4,
  className = ''
}: TagsMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock available tags - in real app, fetch from API
  const availableTags = [
    // Food & Dining
    'Local Restaurants', 'Food Tours', 'Street Food', 'Fine Dining', 'Cooking Classes', 'Wine Tasting',
    'Coffee Culture', 'Vegetarian Options', 'Seafood', 'Desserts',
    
    // Activities & Experiences  
    'Outdoor Adventures', 'Hiking', 'Biking', 'Water Sports', 'Beach Activities', 'Winter Sports',
    'Photography', 'Art Galleries', 'Museums', 'Historical Sites', 'Architecture',
    
    // Entertainment & Culture
    'Nightlife', 'Live Music', 'Theater', 'Festivals', 'Local Events', 'Markets', 'Shopping',
    'Cultural Experiences', 'Language Practice', 'Traditional Crafts',
    
    // Wellness & Relaxation
    'Spas & Wellness', 'Yoga', 'Meditation', 'Nature Walks', 'Parks & Gardens', 'Hot Springs',
    
    // Transportation & Practical
    'Local Transportation', 'Hidden Gems', 'Budget-Friendly', 'Luxury Experiences', 
    'Family-Friendly', 'Pet-Friendly', 'Accessibility', 'Public Transport'
  ]

  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTags.includes(tag)
  )

  const popularTags = [
    'Local Restaurants', 'Hidden Gems', 'Outdoor Adventures', 'Cultural Experiences',
    'Nightlife', 'Food Tours', 'Photography', 'Historical Sites'
  ].filter(tag => !selectedTags.includes(tag))

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else if (selectedTags.length < maxTags) {
      // Add tag
      onTagsChange([...selectedTags, tag])
    }
  }

  const clearAllTags = () => {
    onTagsChange([])
  }

  return (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-[color:var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">What are you interested in?</h3>
          {selectedTags.length > 0 && (
            <button
              onClick={clearAllTags}
              className="text-sm text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] underline focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 rounded"
            >
              Clear all
            </button>
          )}
        </div>
        
        <p className="text-sm text-[color:var(--muted-ink)] mb-4">
          Choose up to {maxTags} interests to help locals personalize your experience.
        </p>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interests..."
            className="input pl-10 pr-4 py-3"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-ink)]" />
        </div>
      </div>

      {/* Selected Tags */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 border-b border-[color:var(--border)]"
          >
            <h4 className="text-sm font-medium text-[color:var(--ink)] mb-3">
              Selected ({selectedTags.length}/{maxTags})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleTagToggle(tag)}
                  className="flex items-center space-x-2 px-3 py-2 bg-[color:var(--brand)] text-white rounded-full text-sm font-medium hover:bg-[color:var(--brand-600)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                >
                  <span>{tag}</span>
                  <X className="w-3 h-3" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available Tags */}
      <div className="p-6">
        {searchQuery ? (
          /* Search Results */
          <div>
            <h4 className="text-sm font-medium text-[color:var(--ink)] mb-3">
              Search Results
            </h4>
            {filteredTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredTags.slice(0, 20).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    disabled={selectedTags.length >= maxTags}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 ${
                      selectedTags.length >= maxTags
                        ? 'border-[color:var(--border)] text-[color:var(--muted-ink)] cursor-not-allowed opacity-50'
                        : 'border-[color:var(--border)] text-[color:var(--ink)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] hover:bg-[color:var(--brand)]/5'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[color:var(--muted-ink)] text-center py-8">
                No interests found matching "{searchQuery}"
              </p>
            )}
          </div>
        ) : (
          /* Popular Tags */
          <div>
            <h4 className="text-sm font-medium text-[color:var(--ink)] mb-3">
              Popular Interests
            </h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {popularTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  disabled={selectedTags.length >= maxTags}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 ${
                    selectedTags.length >= maxTags
                      ? 'border-[color:var(--border)] text-[color:var(--muted-ink)] cursor-not-allowed opacity-50'
                      : 'border-[color:var(--border)] text-[color:var(--ink)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] hover:bg-[color:var(--brand)]/5'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <h4 className="text-sm font-medium text-[color:var(--ink)] mb-3">
              All Interests
            </h4>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {availableTags
                .filter(tag => !selectedTags.includes(tag))
                .map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  disabled={selectedTags.length >= maxTags}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 ${
                    selectedTags.length >= maxTags
                      ? 'border-[color:var(--border)] text-[color:var(--muted-ink)] cursor-not-allowed opacity-50'
                      : 'border-[color:var(--border)] text-[color:var(--ink)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] hover:bg-[color:var(--brand)]/5'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}