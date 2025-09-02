import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Avatar from '../ui/Avatar'

interface MessageBubbleProps {
  message: {
    id: number
    content: string
    created_at: string
    sender_id: string
    sender?: {
      full_name: string
      avatar_url?: string
    } | null
  }
  isOwnMessage: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  isDelivered?: boolean
  isGrouped?: boolean // Whether this message is grouped with previous message from same sender
}

export default function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showTimestamp = true,
  isDelivered = true,
  isGrouped = false
}: MessageBubbleProps) {
  const [imageError, setImageError] = useState(false)

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // Less than 1 minute - show "now"
    if (diff < 60 * 1000) {
      return 'now'
    }
    
    // Less than 24 hours - show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
    
    // More than 24 hours - show date and time
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getAvatarUrl = () => {
    if (message.sender?.avatar_url && !imageError) {
      return supabase.storage.from('avatars').getPublicUrl(message.sender.avatar_url).data.publicUrl
    }
    return null
  }

  const senderName = message.sender?.full_name || 'Unknown User'
  const avatarUrl = getAvatarUrl()

  return (
    <div className={`flex items-end space-x-2 ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}>
      {/* Avatar (for other user's messages) */}
      {!isOwnMessage && showAvatar && (
        <div className={`flex-shrink-0 ${isGrouped ? 'invisible' : ''}`}>
          <Avatar
            src={avatarUrl}
            alt={senderName}
            size={32}
            fallbackText={senderName}
            priority={false}
            loading="lazy"
          />
        </div>
      )}

      {/* Message Container */}
      <div className={`flex flex-col max-w-xs sm:max-w-md lg:max-w-lg ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Sender Name (for other user's messages, only if not grouped) */}
        {!isOwnMessage && !isGrouped && (
          <span className="text-xs font-medium text-gray-600 mb-1 px-1">
            {senderName}
          </span>
        )}

        {/* Message Bubble */}
        <div className={`
          relative px-4 py-2 rounded-2xl break-words
          ${isOwnMessage 
            ? 'bg-blue-600 text-white rounded-br-md' 
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
          }
          ${isGrouped && isOwnMessage ? 'rounded-tr-2xl' : ''}
          ${isGrouped && !isOwnMessage ? 'rounded-tl-2xl' : ''}
        `}>
          {/* Message Content */}
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>

          {/* Timestamp and Delivered Status */}
          <div className={`
            flex items-center justify-end space-x-1 mt-1
            ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}
          `}>
            {showTimestamp && (
              <span className="text-xs">
                {formatTime(message.created_at)}
              </span>
            )}
            
            {/* Delivered Check (only for own messages) */}
            {isOwnMessage && isDelivered && (
              <svg className="w-3 h-3 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for own messages to balance layout */}
      {isOwnMessage && showAvatar && (
        <div className="w-8 flex-shrink-0"></div>
      )}
    </div>
  )
}

// Group consecutive messages from the same sender and add time separators
export const groupMessages = (messages: any[], currentUserId: string) => {
  return messages.map((message, index) => {
    const prevMessage = messages[index - 1]
    const nextMessage = messages[index + 1]
    
    const isGrouped = prevMessage && 
      prevMessage.sender_id === message.sender_id &&
      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 5 * 60 * 1000 // 5 minutes

    const isLast = !nextMessage || 
      nextMessage.sender_id !== message.sender_id ||
      new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime() > 5 * 60 * 1000

    // Determine if we need a time separator before this message
    let showTimeSeparator = false
    if (index === 0) {
      // Always show separator for first message
      showTimeSeparator = true
    } else if (prevMessage) {
      const currentDate = new Date(message.created_at)
      const prevDate = new Date(prevMessage.created_at)
      
      // Show separator if it's a different day
      const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
      const prevDay = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate())
      
      if (currentDay.getTime() !== prevDay.getTime()) {
        showTimeSeparator = true
      }
      // Or if more than 60 minutes have passed
      else if (currentDate.getTime() - prevDate.getTime() > 60 * 60 * 1000) {
        showTimeSeparator = true
      }
    }

    return {
      ...message,
      isGrouped,
      isLast,
      showTimestamp: isLast || 
        (nextMessage && new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime() > 30 * 60 * 1000), // 30 minutes
      showTimeSeparator
    }
  })
}