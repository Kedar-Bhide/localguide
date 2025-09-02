import React from 'react'
import { AvatarSkeleton, TextSkeleton } from '../ui/Skeleton'

interface MessageSkeletonProps {
  isCurrentUser?: boolean
}

export default function MessageSkeleton({ isCurrentUser = false }: MessageSkeletonProps) {
  return (
    <div 
      className={`flex space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
      aria-hidden="true"
    >
      {!isCurrentUser && <AvatarSkeleton size={32} />}
      
      <div className={`flex-1 max-w-xs ${isCurrentUser ? 'flex justify-end' : ''}`}>
        <div 
          className={`
            p-3 rounded-2xl space-y-2
            ${isCurrentUser 
              ? 'bg-blue-50 rounded-br-md' 
              : 'bg-gray-100 rounded-bl-md'
            }
          `}
        >
          <TextSkeleton lines={Math.floor(Math.random() * 3) + 1} />
        </div>
      </div>
    </div>
  )
}

export function MessageThreadSkeleton({ messageCount = 5 }: { messageCount?: number }) {
  return (
    <div className="space-y-4 p-4" aria-hidden="true">
      {Array.from({ length: messageCount }).map((_, index) => (
        <MessageSkeleton 
          key={index} 
          isCurrentUser={Math.random() > 0.6} 
        />
      ))}
    </div>
  )
}

export function ChatSidebarSkeleton() {
  return (
    <div className="space-y-2 p-4" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg">
          <AvatarSkeleton size={40} />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/5" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-10" />
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}