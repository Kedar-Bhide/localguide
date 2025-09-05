'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Search, 
  Plus,
  MoreHorizontal,
  Archive,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/auth'
import { useChatStore } from '@/store/chat'
import { cn, formatDate, formatTime, truncateText } from '@/lib/utils'
import type { ChatWithDetails } from '@/types'

export default function ChatsPage() {
  const router = useRouter()
  const { user, initialize, initialized } = useAuthStore()
  const { 
    chats, 
    chatsLoading, 
    loadChats, 
    initializeSocket, 
    disconnectSocket,
    connected 
  } = useChatStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChat, setSelectedChat] = useState<ChatWithDetails | null>(null)

  // Initialize auth and socket
  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login')
    } else if (user && !connected) {
      initializeSocket(user.id)
      loadChats()
    }

    return () => {
      if (user) {
        disconnectSocket()
      }
    }
  }, [initialized, user, router, connected])

  // Filter chats based on search
  const filteredChats = chats.filter(chat => 
    chat.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleChatClick = (chat: ChatWithDetails) => {
    router.push(`/chats/${chat.id}`)
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-900 flex items-center">
                <MessageCircle className="h-8 w-8 mr-3 text-primary-600" />
                Messages
              </h1>
              <p className="text-neutral-600 mt-1">
                Stay connected with local experts from around the world
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {!connected && (
                <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span>Connecting...</span>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => router.push('/explore')}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                New Chat
              </Button>
              
              <Button
                variant="ghost"
                className="p-2"
                onClick={() => {/* Settings modal */}}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <div className="mb-8">
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
              className="bg-white"
            />
          </div>

          {/* Chat List */}
          {chatsLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-neutral-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                      <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                    </div>
                    <div className="w-16 h-3 bg-neutral-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredChats.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={cn(
                      'bg-white rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-soft-lg hover:-translate-y-1 group border border-neutral-100',
                      selectedChat?.id === chat.id && 'ring-2 ring-primary-500 border-primary-200'
                    )}
                    onClick={() => handleChatClick(chat)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar
                          src={chat.other_user.avatar_url}
                          name={chat.other_user.full_name}
                          size="lg"
                          showOnlineStatus
                          isOnline={Math.random() > 0.5} // Random for demo
                        />
                        {chat.unread_count > 0 && (
                          <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                            {chat.unread_count > 99 ? '99+' : chat.unread_count}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-lg font-semibold text-neutral-900 truncate group-hover:text-primary-700 transition-colors">
                            {chat.other_user.full_name}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-neutral-500">
                            <span>{formatTime(chat.last_message_at)}</span>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 rounded">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-neutral-500 mb-2">
                          <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs mr-2">
                            {chat.user_role === 'traveler' ? 'Local Expert' : 'Traveler'}
                          </span>
                          <span>{chat.city}</span>
                        </div>
                        
                        {chat.last_message ? (
                          <p className={cn(
                            'text-sm leading-relaxed truncate',
                            chat.unread_count > 0 && !chat.last_message.is_from_user
                              ? 'text-neutral-900 font-medium'
                              : 'text-neutral-600'
                          )}>
                            {chat.last_message.is_from_user && (
                              <span className="text-primary-600 mr-1">You:</span>
                            )}
                            {truncateText(chat.last_message.content, 120)}
                          </p>
                        ) : (
                          <p className="text-sm text-neutral-400 italic">
                            Start the conversation...
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="bg-white rounded-3xl p-12 max-w-md mx-auto shadow-soft">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </h3>
                
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  {searchQuery 
                    ? 'Try adjusting your search terms to find the conversation you\'re looking for.'
                    : 'Start exploring and connect with amazing local experts around the world. Your first conversation is just a click away!'
                  }
                </p>
                
                {!searchQuery && (
                  <Button
                    onClick={() => router.push('/explore')}
                    size="lg"
                    className="group"
                    leftIcon={<Plus className="h-5 w-5" />}
                  >
                    Find Local Experts
                  </Button>
                )}
                
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="outline"
                    size="lg"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          {chats.length > 0 && !searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm"
                    onClick={() => router.push('/explore')}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    New Conversation
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm"
                    onClick={() => {/* Archive functionality */}}
                    leftIcon={<Archive className="h-4 w-4" />}
                  >
                    View Archived
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}