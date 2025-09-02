import React from 'react'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  alt: string
  size?: number
  className?: string
  priority?: boolean
  fallbackText?: string
  loading?: 'lazy' | 'eager'
}

export default function Avatar({ 
  src, 
  alt, 
  size = 40, 
  className = '', 
  priority = false,
  fallbackText,
  loading = 'lazy'
}: AvatarProps) {
  const initials = fallbackText?.charAt(0).toUpperCase() || alt?.charAt(0).toUpperCase() || 'U'
  
  const sizeClasses = {
    width: size,
    height: size
  }

  // If we have a valid src, use Next.js Image
  if (src && src.trim()) {
    return (
      <div 
        className={`relative rounded-full overflow-hidden bg-gray-200 ${className}`}
        style={sizeClasses}
      >
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-cover"
          priority={priority}
          loading={loading}
          sizes={`${size}px`}
        />
      </div>
    )
  }

  // Fallback to initials
  return (
    <div 
      className={`
        rounded-full bg-blue-600 text-white flex items-center justify-center font-medium
        ${className}
      `}
      style={sizeClasses}
      aria-label={`Avatar for ${alt}`}
    >
      <span style={{ fontSize: `${size * 0.4}px` }}>
        {initials}
      </span>
    </div>
  )
}