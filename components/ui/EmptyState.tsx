import { ReactNode } from 'react'
import Button from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = ''
}: EmptyStateProps) {
  const defaultIcon = (
    <svg 
      className="w-16 h-16 text-gray-400" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
      />
    </svg>
  )

  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          {icon || defaultIcon}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                variant={primaryAction.variant || 'primary'}
                size="md"
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || 'outline'}
                size="md"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Specific empty state variations
export const NoLocalsFound = ({ 
  location, 
  onExplore, 
  onChangeTags 
}: { 
  location: string
  onExplore: () => void
  onChangeTags: () => void
}) => {
  return (
    <EmptyState
      title={`No local experts in ${location}`}
      description="We're still growing our network in this area. Try adjusting your search criteria or explore nearby cities."
      primaryAction={{
        label: "Change search",
        onClick: onExplore
      }}
      secondaryAction={{
        label: "Modify tags",
        onClick: onChangeTags
      }}
    />
  )
}

export const NoNearbyFound = ({ 
  onExplore, 
  onHome 
}: { 
  onExplore: () => void
  onHome: () => void
}) => {
  return (
    <EmptyState
      title="No experts in nearby cities"
      description="We couldn't find any local experts in this region yet. Try expanding your search to a different area or check back later as we're always adding new experts."
      primaryAction={{
        label: "Try different search",
        onClick: onExplore
      }}
      secondaryAction={{
        label: "Back to home",
        onClick: onHome
      }}
    />
  )
}