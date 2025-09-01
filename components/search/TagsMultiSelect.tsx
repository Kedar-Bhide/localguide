import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
import { Tag, fetchTags, getMockTags } from '../../utils/tags'

interface TagsMultiSelectProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  maxTags?: number
  className?: string
}

interface SelectedTagChipProps {
  tag: string
  onRemove: (tag: string) => void
  index: number
}

const SelectedTagChip: React.FC<SelectedTagChipProps> = ({ tag, onRemove, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, x: -20 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    exit={{ opacity: 0, scale: 0.8, x: -20 }}
    transition={{ 
      type: 'spring', 
      stiffness: 500, 
      damping: 30,
      delay: index * 0.05 
    }}
    className="flex items-center space-x-2 px-3 py-2 bg-[color:var(--brand)] text-white rounded-full text-sm font-medium shadow-sm"
  >
    <span>{tag}</span>
    <button
      onClick={() => onRemove(tag)}
      className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
      aria-label={`Remove ${tag}`}
    >
      <X className="w-3 h-3" />
    </button>
  </motion.div>
)

export default function TagsMultiSelect({
  selectedTags,
  onTagsChange,
  maxTags = 4,
  className = ''
}: TagsMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load tags on component mount
  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setLoading(true)
      setError(null)
      const tags = await fetchTags()
      setAvailableTags(tags)
    } catch (err) {
      console.error('Failed to load tags:', err)
      setError('Failed to load tags')
      // Use mock data as fallback
      setAvailableTags(getMockTags())
    } finally {
      setLoading(false)
    }
  }

  // Filter tags based on search query and availability
  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTags.includes(tag.name)
  )

  // Get popular tags that aren't selected
  const popularTags = availableTags
    .filter(tag => tag.is_popular && !selectedTags.includes(tag.name))
    .slice(0, 8)

  // Group filtered tags by category
  const tagsByCategory = filteredTags.reduce((acc, tag) => {
    const category = tag.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(tag)
    return acc
  }, {} as Record<string, Tag[]>)

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      // Remove tag
      onTagsChange(selectedTags.filter(t => t !== tagName))
    } else if (selectedTags.length < maxTags) {
      // Add tag
      onTagsChange([...selectedTags, tagName])
    }
  }

  const handleTagRemove = (tagName: string) => {
    onTagsChange(selectedTags.filter(t => t !== tagName))
  }

  const clearAllTags = () => {
    onTagsChange([])
  }

  if (loading) {
    return (
      <div className={`bg-white ${className}`}>
        <div className="p-6 border-b border-[color:var(--border)]">
          <div className="animate-pulse">
            <div className="h-6 bg-[color:var(--bg-soft)] rounded mb-4"></div>
            <div className="h-4 bg-[color:var(--bg-soft)] rounded mb-4 w-2/3"></div>
            <div className="h-10 bg-[color:var(--bg-soft)] rounded"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[color:var(--bg-soft)] rounded w-1/4"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-8 bg-[color:var(--bg-soft)] rounded-full w-20"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-[color:var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">What interests you?</h3>
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
            className="input pl-10 pr-4 py-3 focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-ink)]" />
        </div>

        {error && (
          <div className="mt-3 p-3 bg-[color:var(--error)]/10 border border-[color:var(--error)]/20 rounded-lg">
            <p className="text-sm text-[color:var(--error)]">{error}</p>
          </div>
        )}
      </div>

      {/* Selected Tags */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 border-b border-[color:var(--border)]"
          >
            <h4 className="text-sm font-medium text-[color:var(--ink)] mb-3">
              Selected ({selectedTags.length}/{maxTags})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag, index) => (
                <SelectedTagChip
                  key={tag}
                  tag={tag}
                  onRemove={handleTagRemove}
                  index={index}
                />
              ))}
            </div>
            
            {selectedTags.length >= maxTags && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[color:var(--warning)] mt-2"
              >
                Maximum {maxTags} interests selected
              </motion.p>
            )}
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
              <div className="space-y-6">
                {Object.entries(tagsByCategory).map(([category, tags]) => (
                  <div key={category}>
                    <h5 className="text-xs font-medium text-[color:var(--muted-ink)] mb-2 uppercase tracking-wide">
                      {category}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <TagButton
                          key={tag.id}
                          tag={tag}
                          isSelected={selectedTags.includes(tag.name)}
                          isDisabled={selectedTags.length >= maxTags && !selectedTags.includes(tag.name)}
                          onClick={() => handleTagToggle(tag.name)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[color:var(--muted-ink)]">No interests found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-[color:var(--brand)] hover:underline mt-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 rounded"
                >
                  Show all interests
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Popular Tags and Categories */
          <div className="space-y-6">
            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[color:var(--ink)] mb-3">
                  Popular Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <TagButton
                      key={tag.id}
                      tag={tag}
                      isSelected={selectedTags.includes(tag.name)}
                      isDisabled={selectedTags.length >= maxTags && !selectedTags.includes(tag.name)}
                      onClick={() => handleTagToggle(tag.name)}
                      isPopular
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Tags by Category */}
            <div>
              <h4 className="text-sm font-medium text-[color:var(--ink)] mb-3">
                All Interests
              </h4>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {Object.entries(
                  availableTags
                    .filter(tag => !selectedTags.includes(tag.name))
                    .reduce((acc, tag) => {
                      const category = tag.category || 'Other'
                      if (!acc[category]) {
                        acc[category] = []
                      }
                      acc[category].push(tag)
                      return acc
                    }, {} as Record<string, Tag[]>)
                ).map(([category, tags]) => (
                  <div key={category}>
                    <h5 className="text-xs font-medium text-[color:var(--muted-ink)] mb-2 uppercase tracking-wide">
                      {category}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <TagButton
                          key={tag.id}
                          tag={tag}
                          isSelected={selectedTags.includes(tag.name)}
                          isDisabled={selectedTags.length >= maxTags && !selectedTags.includes(tag.name)}
                          onClick={() => handleTagToggle(tag.name)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Tag button component
interface TagButtonProps {
  tag: Tag
  isSelected: boolean
  isDisabled: boolean
  onClick: () => void
  isPopular?: boolean
}

const TagButton: React.FC<TagButtonProps> = ({ 
  tag, 
  isSelected, 
  isDisabled, 
  onClick, 
  isPopular = false 
}) => (
  <motion.button
    whileHover={{ scale: isDisabled ? 1 : 1.02 }}
    whileTap={{ scale: isDisabled ? 1 : 0.98 }}
    onClick={onClick}
    disabled={isDisabled}
    className={`
      px-3 py-2 rounded-full text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 relative
      ${isSelected 
        ? 'bg-[color:var(--brand)] text-white border-[color:var(--brand)]' 
        : isDisabled
        ? 'border-[color:var(--border)] text-[color:var(--muted-ink)] cursor-not-allowed opacity-50'
        : 'border-[color:var(--border)] text-[color:var(--ink)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] hover:bg-[color:var(--brand)]/5'
      }
      ${isPopular && !isSelected ? 'ring-1 ring-[color:var(--brand)]/20' : ''}
    `}
  >
    {tag.name}
    {isPopular && !isSelected && (
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-[color:var(--brand)] rounded-full"></span>
    )}
  </motion.button>
)