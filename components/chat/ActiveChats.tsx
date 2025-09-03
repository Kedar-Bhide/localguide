import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Card from '../ui/Card'
import Button from '../ui/Button'
import ResponseIndicator from '../ui/ResponseIndicator'
import { getUserActiveChats } from '../../utils/api'
import { getUser, supabase } from '../../lib/supabase'

interface ActiveChat {
  id: string
  city: string
  created_at: string
  last_message_at?: string
  other_participant: {
    name: string
    avatar_url?: string
    role: 'traveler' | 'local'
    last_active_at?: string
  } | null
}

interface ActiveChatsProps {
  refreshTrigger?: number // Optional prop to trigger refresh from parent
}

export default function ActiveChats({ refreshTrigger }: ActiveChatsProps) {
  const router = useRouter()
  const [chats, setChats] = useState<ActiveChat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActiveChats = async () => {
    try {
      const user = await getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      const activeChats = await getUserActiveChats(user.id)
      setChats(activeChats as ActiveChat[])
      setError(null)
    } catch (error) {
      console.error('Error fetching active chats:', error)
      setError('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveChats()
  }, [refreshTrigger])

  const handleChatClick = (chatId: string) => {
    router.push(`/messages/${chatId}`)
  }

  const formatLastActivity = (lastMessageAt?: string) => {
    if (!lastMessageAt) return 'New chat'
    
    const date = new Date(lastMessageAt)
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
    
    // More than 24 hours - show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Active Chats</h3>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Your Active Chats</h3>
      
      {error ? (
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
          <Button 
            onClick={fetchActiveChats} 
            variant="secondary" 
            size="sm" 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471L3 21l2.471-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-2">No active chats yet</p>
          <p className="text-gray-400 text-xs">
            Connect with locals to start conversations
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="flex-shrink-0 mr-3">
                {chat.other_participant?.avatar_url ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={supabase.storage.from('avatars').getPublicUrl(chat.other_participant.avatar_url).data.publicUrl}
                    alt={chat.other_participant.name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {chat.other_participant?.name.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {chat.city} chat with {chat.other_participant?.name || 'Unknown User'}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500">
                    {chat.other_participant?.role === 'local' ? 'Local Expert' : 'Traveler'} • {formatLastActivity(chat.last_message_at)}
                  </p>
                  {chat.other_participant?.role === 'local' && (
                    <ResponseIndicator 
                      lastActiveAt={chat.other_participant.last_active_at}
                      className="text-xs"
                      showDot={false}
                    />
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}