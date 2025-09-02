import { useState, useEffect } from 'react'
import { LocalCardData } from '../../types'
import { supabase } from '../../lib/supabase'
import Avatar from './Avatar'

interface LocalCardProps {
  data?: LocalCardData
  loading?: boolean
  onClick?: () => void
}

export default function LocalCard({ data, loading = false, onClick }: LocalCardProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Load avatar URL if available
  useEffect(() => {
    if (data?.user.avatar_url) {
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.user.avatar_url)
      setAvatarUrl(urlData.publicUrl)
    }
  }, [data?.user.avatar_url])

  // Helper function to compute response time from last_active_at
  const getResponseTime = (lastActiveAt?: string): string => {
    if (!lastActiveAt) return 'a few days'
    
    const now = new Date()
    const lastActive = new Date(lastActiveAt)
    const diffHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'an hour'
    if (diffHours < 24) return 'a few hours'
    if (diffHours < 48) return 'a day'
    if (diffHours < 168) return 'a few days' // 7 days
    return 'a week'
  }

  // Helper function to truncate bio to 2 lines (approximately 120 characters)
  const truncateBio = (bio: string): string => {
    if (bio.length <= 120) return bio
    return bio.slice(0, 117) + '...'
  }

  if (loading) {
    return <LocalCardSkeleton />
  }

  if (!data) {
    return null
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div 
      className={`
        bg-white rounded-lg border border-gray-200 p-6 
        transition-all duration-200 ease-out
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 focus:ring-2 focus:ring-blue-500 focus:outline-none' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      {/* Avatar and Name Row */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="flex-shrink-0">
          <Avatar
            src={avatarUrl}
            alt={`${data.user.full_name} avatar`}
            size={48}
            fallbackText={data.user.full_name}
            priority={false}
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {data.user.full_name}
          </h3>
          <p className="text-sm text-gray-600">
            {data.city}, {data.country}
          </p>
        </div>
      </div>

      {/* Bio Excerpt */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed h-10 overflow-hidden">
          {truncateBio(data.bio)}
        </p>
      </div>

      {/* Tags Chips */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {data.tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
          {data.tags.length > 4 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{data.tags.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Status Line */}
      <div className="flex items-center text-sm text-gray-500">
        <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
        <span>Usually responds within {getResponseTime(data.user.last_active_at)}</span>
      </div>
    </div>
  )
}

function LocalCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      {/* Avatar and Name Row */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
        <div className="flex-1 min-w-0">
          <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* Bio Lines */}
      <div className="mb-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-14"></div>
        </div>
      </div>

      {/* Status Line */}
      <div className="flex items-center">
        <div className="h-2 w-2 rounded-full bg-gray-200 mr-2"></div>
        <div className="h-4 bg-gray-200 rounded w-40"></div>
      </div>
    </div>
  )
}