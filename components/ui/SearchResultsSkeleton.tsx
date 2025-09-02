import React from 'react'
import { CardSkeleton, TextSkeleton, ButtonSkeleton } from './Skeleton'

export default function SearchResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6" aria-hidden="true" role="status" aria-label="Loading search results">
      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-3 items-center">
        <ButtonSkeleton className="rounded-full" />
        <ButtonSkeleton className="rounded-full" />
        <ButtonSkeleton className="rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Results grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <SearchResultCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

function SearchResultCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4" aria-hidden="true">
      {/* Header with avatar and name */}
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/5" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div 
            key={index} 
            className="h-6 bg-gray-200 rounded-full animate-pulse"
            style={{ width: `${60 + Math.random() * 40}px` }}
          />
        ))}
      </div>

      {/* Action button */}
      <div className="pt-2">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full" />
      </div>

      {/* Rating and response time */}
      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-8" />
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
      </div>
    </div>
  )
}