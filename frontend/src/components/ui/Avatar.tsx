'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn, getInitials, generateAvatarUrl } from '@/lib/utils'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  showOnlineStatus?: boolean
  isOnline?: boolean
  onClick?: () => void
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-20 w-20 text-xl'
}

const statusSizeClasses = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4',
  '2xl': 'h-5 w-5'
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className,
  showOnlineStatus = false,
  isOnline = false,
  onClick
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  const initials = name ? getInitials(name) : ''
  const avatarUrl = src || (name ? generateAvatarUrl(name, 80) : null)
  
  const handleImageError = () => {
    setImageError(true)
  }

  const containerClasses = cn(
    'relative inline-flex items-center justify-center rounded-full bg-neutral-100 font-medium text-neutral-600 overflow-hidden',
    sizeClasses[size],
    onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
    className
  )

  const statusClasses = cn(
    'absolute -bottom-0 -right-0 block rounded-full border-2 border-white',
    statusSizeClasses[size],
    isOnline ? 'bg-success-500' : 'bg-neutral-400'
  )

  return (
    <div className={containerClasses} onClick={onClick}>
      {avatarUrl && !imageError ? (
        <Image
          src={avatarUrl}
          alt={alt || name || 'Avatar'}
          fill
          className="object-cover"
          sizes="(max-width: 100px) 100px"
          onError={handleImageError}
        />
      ) : initials ? (
        <span className="select-none">{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2" />
      )}
      
      {showOnlineStatus && (
        <span className={statusClasses} />
      )}
    </div>
  )
}