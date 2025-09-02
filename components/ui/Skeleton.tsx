import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  circle?: boolean
  lines?: number
  animate?: boolean
}

export default function Skeleton({ 
  className = '', 
  width, 
  height, 
  circle = false,
  lines = 1,
  animate = true
}: SkeletonProps) {
  const baseClasses = `bg-gray-200 ${animate ? 'animate-pulse' : ''}`
  
  if (circle) {
    return (
      <div 
        className={`${baseClasses} rounded-full ${className}`}
        style={{ width, height }}
        aria-hidden="true"
      />
    )
  }

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} rounded h-4`}
            style={{ 
              width: index === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div 
      className={`${baseClasses} rounded ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

// Pre-built skeleton components for common use cases
export function TextSkeleton({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return <Skeleton lines={lines} height="1rem" className={className} />
}

export function AvatarSkeleton({ size = 40, className = '' }: { size?: number; className?: string }) {
  return <Skeleton circle width={size} height={size} className={className} />
}

export function ButtonSkeleton({ className = '' }: { className?: string }) {
  return <Skeleton width="120px" height="40px" className={`rounded-lg ${className}`} />
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg space-y-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <AvatarSkeleton size={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="1.25rem" />
          <Skeleton width="40%" height="1rem" />
        </div>
      </div>
      <TextSkeleton lines={3} />
      <div className="flex space-x-2">
        <ButtonSkeleton />
        <ButtonSkeleton />
      </div>
    </div>
  )
}