import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import ChatLayout from '../../components/chat/ChatLayout'
import MessageComposer from '../../components/chat/MessageComposer'
import MessageBubble, { groupMessages } from '../../components/chat/MessageBubble'
import TypingIndicator from '../../components/chat/TypingIndicator'
import TimeSeparator from '../../components/chat/TimeSeparator'
import { MessageThreadSkeleton } from '../../components/chat/MessageSkeleton'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { getChatDetails, getMessages, sendMessage } from '../../utils/api'
import { getUser, supabase } from '../../lib/supabase'
import type { User as AuthUser } from '@supabase/supabase-js'

interface MessageData {
  id: number
  content: string
  created_at: string
  sender_id: string
  sender: {
    full_name: string
    avatar_url?: string
  } | null
}

interface ChatData {
  id: string
  city: string
  created_at: string
  last_message_at?: string
  chat_participants: Array<{
    user_id: string
    role: 'traveler' | 'local'
    user: {
      full_name: string
      avatar_url?: string
    } | null
  }>
}

export default function ChatMessages() {
  const router = useRouter()
  const { chat_id } = router.query
  
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [chat, setChat] = useState<ChatData | null>(null)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Realtime subscription for new messages
  useEffect(() => {
    if (!chat_id || typeof chat_id !== 'string') return

    let subscription: any = null
    let fallbackInterval: NodeJS.Timeout | null = null

    const fetchMessages = async () => {
      try {
        const messagesData = await getMessages(chat_id)
        setMessages(messagesData as unknown as MessageData[])
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    const setupRealtimeSubscription = async () => {
      try {
        // Initial fetch
        await fetchMessages()

        // Subscribe to new message inserts for this specific chat
        subscription = supabase
          .channel(`messages:${chat_id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `chat_id=eq.${chat_id}`
            },
            async (payload) => {
              console.log('New message received:', payload)
              
              // Show typing indicator for messages from other users
              const isFromOtherUser = payload.new.sender_id !== currentUser?.id
              if (isFromOtherUser) {
                setShowTypingIndicator(true)
                
                // Clear any existing timeout
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current)
                }
                
                // Hide typing indicator after 2 seconds and show the message
                typingTimeoutRef.current = setTimeout(async () => {
                  setShowTypingIndicator(false)
                  
                  try {
                    // Fetch the complete message with sender info to ensure consistency
                    const messagesData = await getMessages(chat_id)
                    setMessages(messagesData as unknown as MessageData[])
                  } catch (error) {
                    console.error('Error fetching updated messages:', error)
                    
                    // Fallback: add the new message with minimal info
                    const newMessage = {
                      id: payload.new.id,
                      content: payload.new.content,
                      created_at: payload.new.created_at,
                      sender_id: payload.new.sender_id,
                      sender: null 
                    } as MessageData

                    setMessages(prevMessages => [...prevMessages, newMessage])
                  }
                }, 2000)
              } else {
                // For own messages, update immediately
                try {
                  const messagesData = await getMessages(chat_id)
                  setMessages(messagesData as unknown as MessageData[])
                } catch (error) {
                  console.error('Error fetching updated messages:', error)
                }
              }
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status)
            
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to realtime updates')
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('Realtime subscription failed, falling back to polling')
              setupFallbackPolling()
            }
          })
      } catch (error) {
        console.error('Failed to setup realtime subscription:', error)
        setupFallbackPolling()
      }
    }

    const setupFallbackPolling = () => {
      console.log('Setting up fallback polling')
      if (fallbackInterval) clearInterval(fallbackInterval)
      
      fallbackInterval = setInterval(async () => {
        await fetchMessages()
      }, 3000)
    }

    // Start with realtime, fallback to polling if needed
    setupRealtimeSubscription()

    return () => {
      // Cleanup realtime subscription
      if (subscription) {
        supabase.removeChannel(subscription)
        subscription = null
      }
      
      // Cleanup polling fallback
      if (fallbackInterval) {
        clearInterval(fallbackInterval)
        fallbackInterval = null
      }
      
      // Cleanup typing indicator timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
    }
  }, [chat_id])

  // Load chat details and user info
  useEffect(() => {
    const loadChatData = async () => {
      if (!chat_id || typeof chat_id !== 'string') return

      try {
        setLoading(true)
        
        const [user, chatData] = await Promise.all([
          getUser(),
          getChatDetails(chat_id)
        ])

        setCurrentUser(user)
        setChat(chatData as unknown as ChatData)
      } catch (error) {
        console.error('Error loading chat:', error)
        setError('Unable to load chat. You may not have access to this conversation.')
      } finally {
        setLoading(false)
      }
    }

    loadChatData()
  }, [chat_id])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !currentUser || !chat_id || typeof chat_id !== 'string') return

    try {
      setSending(true)
      await sendMessage(chat_id, currentUser.id, messageContent.trim())
      
      // Immediately fetch messages to show the new message
      const messagesData = await getMessages(chat_id)
      setMessages(messagesData as unknown as MessageData[])
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
      throw error // Re-throw to let composer handle it
    } finally {
      setSending(false)
    }
  }

  const getBackLink = () => {
    if (!currentUser || !chat) return '/home'
    
    const currentUserRole = chat.chat_participants.find(p => p.user_id === currentUser.id)?.role
    return currentUserRole === 'local' ? '/requests' : '/explore'
  }

  const getOtherParticipant = () => {
    if (!currentUser || !chat) return null
    return chat.chat_participants.find(p => p.user_id !== currentUser.id)
  }

  const formatMessageTime = (timestamp: string) => {
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
    
    // More than 24 hours - show date and time
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Messages - LocalGuide</title>
          <meta name="description" content="Chat with local experts" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ChatLayout currentChatId={chat_id as string}>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <MessageThreadSkeleton messageCount={8} />
            </div>
          </div>
        </ChatLayout>
      </ProtectedRoute>
    )
  }

  if (error || !chat || !currentUser) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Messages - LocalGuide</title>
          <meta name="description" content="Chat with local experts" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ChatLayout currentChatId={chat_id as string}>
          <div className="flex items-center justify-center h-full p-8">
            <Card className="text-center py-12 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Chat Not Found'}
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'This chat may not exist or you may not have access to it.'}
              </p>
              <Button onClick={() => router.push(getBackLink())}>
                Go Back
              </Button>
            </Card>
          </div>
        </ChatLayout>
      </ProtectedRoute>
    )
  }

  const otherParticipant = getOtherParticipant()

  return (
    <ProtectedRoute>
      <Head>
        <title>Messages - LocalGuide</title>
        <meta name="description" content="Chat with local experts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ChatLayout currentChatId={chat_id as string}>
        <div className="h-full flex flex-col bg-white">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            {otherParticipant && otherParticipant.user && (
              <div className="flex items-center space-x-3">
                {otherParticipant.user.avatar_url ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={supabase.storage.from('avatars').getPublicUrl(otherParticipant.user.avatar_url).data.publicUrl}
                    alt={otherParticipant.user.full_name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {otherParticipant.user.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-semibold">
                    {otherParticipant.user.full_name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {chat.city} • {otherParticipant.role}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.456-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
                <p className="text-gray-500">Send a message to begin your chat with this local expert.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {groupMessages(messages, currentUser?.id || '').map((message, index) => (
                  <div key={message.id}>
                    {message.showTimeSeparator && (
                      <TimeSeparator timestamp={message.created_at} />
                    )}
                    <MessageBubble
                      message={message}
                      isOwnMessage={message.sender_id === currentUser?.id}
                      isGrouped={message.isGrouped}
                      showTimestamp={message.showTimestamp}
                      isDelivered={true} // For now, assume all messages are delivered
                    />
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {showTypingIndicator && otherParticipant?.user && (
                  <TypingIndicator
                    senderName={otherParticipant.user.full_name}
                    avatar={otherParticipant.user.avatar_url ? 
                      supabase.storage.from('avatars').getPublicUrl(otherParticipant.user.avatar_url).data.publicUrl 
                      : undefined
                    }
                  />
                )}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Composer */}
          <MessageComposer
            onSendMessage={handleSendMessage}
            sending={sending}
            disabled={false}
            placeholder="Type your message..."
          />
        </div>
      </ChatLayout>
    </ProtectedRoute>
  )
}