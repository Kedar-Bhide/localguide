import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { ChatWithDetails, Message } from '@/types'

interface ChatStore {
  chats: ChatWithDetails[]
  currentMessages: Message[]
  messagesLoading: boolean
  chatsLoading: boolean
  typingUsers: any[]
  connected: boolean
  
  // Actions
  loadChats: () => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
  sendMessage: (chatId: string, content: string) => Promise<void>
  setCurrentChat: (chatId: string | null) => void
  initializeSocket: (userId: string) => void
  disconnectSocket: () => void
  markAsRead: (chatId: string, messageIds: string[]) => Promise<void>
  updateTypingStatus: (chatId: string, typing: boolean, userName?: string) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentMessages: [],
  messagesLoading: false,
  chatsLoading: false,
  typingUsers: [],
  connected: false,

  loadChats: async () => {
    try {
      set({ chatsLoading: true })
      
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')
      
      // Get chats where user is a participant
      const { data: chatParticipants, error: participantError } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          role,
          chats(
            id,
            city,
            created_at,
            last_message_at
          )
        `)
        .eq('user_id', user.user.id)
        
      if (participantError) throw participantError
      
      // Transform data to match expected format
      const transformedChats = await Promise.all(
        (chatParticipants || []).map(async (participant) => {
          const chat = Array.isArray(participant.chats) ? participant.chats[0] : participant.chats
          if (!chat) return null
          
          // Get other participants in this chat
          const { data: otherParticipants } = await supabase
            .from('chat_participants')
            .select(`
              user_id,
              role,
              profiles(
                id,
                full_name,
                avatar_url
              )
            `)
            .eq('chat_id', chat.id)
            .neq('user_id', user.user.id)
            .limit(1)
            .single()
          
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          return {
            id: chat.id,
            city: chat.city,
            status: 'active',
            last_message_at: chat.last_message_at || chat.created_at,
            created_at: chat.created_at,
            other_user: otherParticipants?.profiles ? {
              id: (otherParticipants.profiles as any)?.id || 'unknown',
              full_name: (otherParticipants.profiles as any)?.full_name || 'Unknown User',
              avatar_url: (otherParticipants.profiles as any)?.avatar_url
            } : null,
            user_role: participant.role,
            last_message: lastMessage ? {
              id: lastMessage.id,
              content: lastMessage.content,
              sender_id: lastMessage.sender_id,
              created_at: lastMessage.created_at,
              is_from_user: lastMessage.sender_id === user.user.id
            } : null,
            unread_count: 0 // Placeholder - would need to implement proper unread counting
          }
        })
      )
      
      const validChats = transformedChats.filter(chat => chat !== null)
      set({ chats: validChats, chatsLoading: false })
    } catch (error) {
      console.error('Failed to load chats:', error)
      set({ chats: [], chatsLoading: false })
    }
  },

  loadMessages: async (chatId: string) => {
    try {
      set({ messagesLoading: true })
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(
            full_name,
            avatar_url
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      set({ currentMessages: data || [], messagesLoading: false })
    } catch (error) {
      console.error('Failed to load messages:', error)
      set({ currentMessages: [], messagesLoading: false })
    }
  },

  sendMessage: async (chatId: string, content: string) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.user.id,
          content,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Add to current messages
      const { currentMessages } = get()
      set({ currentMessages: [...currentMessages, data] })
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  },

  setCurrentChat: (chatId: string | null) => {
    if (chatId) {
      get().loadMessages(chatId)
    } else {
      set({ currentMessages: [] })
    }
  },

  initializeSocket: (userId: string) => {
    // Placeholder for Socket.IO connection
    set({ connected: true })
  },

  disconnectSocket: () => {
    set({ connected: false })
  },

  markAsRead: async (chatId: string, messageIds: string[]) => {
    try {
      // Try to update read status, but don't fail if column doesn't exist
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds)

      if (error && !error.message.includes('column "is_read"')) {
        throw error
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  },

  updateTypingStatus: (chatId: string, typing: boolean, userName?: string) => {
    // Placeholder for typing indicators
    set({ typingUsers: typing ? [{ userName }] : [] })
  }
}))