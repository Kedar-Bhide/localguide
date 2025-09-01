import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { getUserChatsWithMessages } from '../../utils/api'
import { getUser, supabase } from '../../lib/supabase'
import type { User as AuthUser } from '@supabase/supabase-js'

interface ChatConversation {
  id: string
  city: string
  title: string
  last_message?: string
  last_message_at?: string
  other_participant: {
    name: string
    avatar_url?: string
    role: 'local' | 'traveler'
  } | null
}

interface ChatLayoutProps {
  children: ReactNode
  currentChatId?: string
}

export default function ChatLayout({ children, currentChatId }: ChatLayoutProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)

  // Load user and conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const user = await getUser()
        setCurrentUser(user)
        
        if (user) {
          const chats = await getUserChatsWithMessages(user.id)
          setConversations(chats as ChatConversation[])
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [])

  // Show mobile chat view when chat is selected
  useEffect(() => {
    setShowMobileChat(!!currentChatId)
  }, [currentChatId])

  // Format time for conversation list
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // Less than 24 hours - show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
    
    // Less than 7 days - show day
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    }
    
    // Older - show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleConversationClick = (chatId: string) => {
    router.push(`/messages/${chatId}`)
  }

  const handleBackToList = () => {
    router.push('/messages')
  }

  // Mobile back button handler
  const handleMobileBack = () => {
    setShowMobileChat(false)
    router.push('/messages')
  }

  if (loading) {
    return (
      <div className="h-screen flex">
        {/* Left pane skeleton */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right pane skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Pane - Conversations List */}
      <div className={`
        w-full md:w-1/3 lg:w-1/4 xl:w-1/3 bg-white border-r border-gray-200 flex flex-col
        ${showMobileChat ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
            <div className="text-sm text-gray-500">
              {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.456-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Start connecting with local experts to begin chatting
              </p>
              <button
                onClick={() => router.push('/explore')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Find Local Experts
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    currentChatId === conversation.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div className="flex space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {conversation.other_participant?.avatar_url ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={supabase.storage.from('avatars').getPublicUrl(conversation.other_participant.avatar_url).data.publicUrl}
                          alt={conversation.other_participant?.name || 'User'}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-lg">
                            {conversation.other_participant?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title and Time */}
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.title}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {/* Unread dot placeholder - can be enhanced with real unread logic */}
                          {conversation.last_message && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>
                      </div>

                      {/* Last Message */}
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Chat Thread */}
      <div className={`
        flex-1 flex flex-col
        ${showMobileChat ? 'flex' : 'hidden md:flex'}
      `}>
        {/* Mobile back button */}
        {showMobileChat && (
          <div className="md:hidden p-4 border-b border-gray-200 bg-white">
            <button
              onClick={handleMobileBack}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to conversations
            </button>
          </div>
        )}

        {/* Chat Content */}
        <div className="flex-1 flex flex-col">
          {currentChatId ? (
            children
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.456-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}