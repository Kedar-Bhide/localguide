import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/layout/Layout'
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
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !currentUser || !chat_id || typeof chat_id !== 'string') return

    try {
      setSending(true)
      await sendMessage(chat_id, currentUser.id, newMessage.trim())
      setNewMessage('')
      
      // Immediately fetch messages to show the new message
      const messagesData = await getMessages(chat_id)
      setMessages(messagesData as unknown as MessageData[])
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
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
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error || !chat || !currentUser) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
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
      </Layout>
    )
  }

  const otherParticipant = getOtherParticipant()

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Messages - LocalGuide</title>
          <meta name="description" content="Chat with local experts" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="max-w-4xl mx-auto px-4 h-[calc(100vh-200px)] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push(getBackLink())}
                variant="outline"
                size="sm"
              >
                ← Back
              </Button>
              
              {otherParticipant && otherParticipant.user && (
                <div className="flex items-center space-x-3">
                  {otherParticipant.user.avatar_url ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={otherParticipant.user.avatar_url}
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
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === currentUser.id
                const senderName = message.sender?.full_name || 'Unknown User'
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {!isOwnMessage && (
                        <p className="text-xs font-medium mb-1 text-gray-600">
                          {senderName}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 pt-4">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={sending || !newMessage.trim()}
                variant="primary"
                size="sm"
              >
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}