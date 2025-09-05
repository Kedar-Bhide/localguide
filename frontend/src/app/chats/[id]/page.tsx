'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Archive,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/auth'
import { useChatStore } from '@/store/chat'
import { cn, formatTime, formatDate } from '@/lib/utils'
import type { Message } from '@/types'

interface ChatPageProps {
  params: {
    id: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const router = useRouter()
  const { user, initialize, initialized } = useAuthStore()
  const {
    chats,
    currentMessages,
    messagesLoading,
    typingUsers,
    setCurrentChat,
    sendMessage,
    loadMessages,
    initializeSocket,
    markAsRead,
    updateTypingStatus,
    connected
  } = useChatStore()

  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showChatInfo, setShowChatInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const chatId = params.id
  const currentChat = chats.find(chat => chat.id === chatId)
  const otherUser = currentChat?.other_user

  // Initialize and load chat
  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login')
    } else if (user && chatId) {
      if (!connected) {
        initializeSocket(user.id)
      }
      setCurrentChat(chatId)
    }

    return () => {
      setCurrentChat(null)
    }
  }, [initialized, user, chatId, connected])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])

  // Mark messages as read when chat is viewed
  useEffect(() => {
    if (currentMessages.length > 0 && currentChat) {
      const unreadMessages = currentMessages
        .filter(msg => !msg.is_read && msg.sender_id !== user?.id)
        .map(msg => msg.id)

      if (unreadMessages.length > 0) {
        markAsRead(chatId, unreadMessages)
      }
    }
  }, [currentMessages, currentChat, user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user) return

    const content = messageInput.trim()
    setMessageInput('')
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false)
      updateTypingStatus(chatId, false, user.full_name)
    }

    try {
      await sendMessage(chatId, content)
      inputRef.current?.focus()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessageInput(value)

    if (!user) return

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      updateTypingStatus(chatId, true, user.full_name)
    } else if (!value.trim() && isTyping) {
      setIsTyping(false)
      updateTypingStatus(chatId, false, user.full_name)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        updateTypingStatus(chatId, false, user.full_name)
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const isMessageFromUser = (message: Message) => message.sender_id === user?.id

  const shouldShowDateDivider = (message: Message, index: number) => {
    if (index === 0) return true
    const prevMessage = currentMessages[index - 1]
    if (!prevMessage) return true
    const currentDate = new Date(message.created_at).toDateString()
    const prevDate = new Date(prevMessage.created_at).toDateString()
    return currentDate !== prevDate
  }

  const shouldShowAvatar = (message: Message, index: number) => {
    if (isMessageFromUser(message)) return false
    if (index === currentMessages.length - 1) return true
    const nextMessage = currentMessages[index + 1]
    return !nextMessage || isMessageFromUser(nextMessage) || 
           nextMessage.sender_id !== message.sender_id
  }

  if (!initialized || !user || !currentChat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setShowChatInfo(true)}
            >
              <Avatar
                src={otherUser?.avatar_url}
                name={otherUser?.full_name}
                size="lg"
                showOnlineStatus
                isOnline={Math.random() > 0.5} // Random for demo
              />
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  {otherUser?.full_name}
                </h2>
                <div className="flex items-center text-sm text-neutral-500">
                  <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs mr-2">
                    {currentChat.user_role === 'traveler' ? 'Local Expert' : 'Traveler'}
                  </span>
                  <span>{currentChat.city}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Info className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Connection status */}
        {!connected && (
          <div className="mt-2 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span>Reconnecting...</span>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messagesLoading && currentMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            <AnimatePresence>
              {currentMessages.map((message, index) => (
                <div key={message.id}>
                  {/* Date Divider */}
                  {shouldShowDateDivider(message, index) && (
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-neutral-200 text-neutral-600 text-xs px-3 py-1 rounded-full">
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex items-end space-x-2',
                      isMessageFromUser(message) ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {/* Avatar for received messages */}
                    {!isMessageFromUser(message) && shouldShowAvatar(message, index) && (
                      <Avatar
                        src={otherUser?.avatar_url}
                        name={otherUser?.full_name}
                        size="sm"
                        className="mb-1"
                      />
                    )}
                    
                    {!isMessageFromUser(message) && !shouldShowAvatar(message, index) && (
                      <div className="w-8"></div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        'max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl break-words',
                        isMessageFromUser(message)
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                          : 'bg-white text-neutral-900 shadow-soft border border-neutral-100'
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div className={cn(
                        'text-xs mt-1 flex items-center justify-end space-x-1',
                        isMessageFromUser(message) ? 'text-white/70' : 'text-neutral-500'
                      )}>
                        <span>{formatTime(message.created_at)}</span>
                        {isMessageFromUser(message) && (
                          <div className="flex">
                            <div className={cn(
                              'w-3 h-3 rounded-full',
                              message.is_read ? 'bg-white/70' : 'bg-white/40'
                            )} />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2"
                >
                  <Avatar
                    src={otherUser?.avatar_url}
                    name={otherUser?.full_name}
                    size="sm"
                  />
                  <div className="bg-white px-4 py-3 rounded-2xl shadow-soft border border-neutral-100">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-neutral-200 px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32"
                style={{ minHeight: '48px' }}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="p-3 rounded-2xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}