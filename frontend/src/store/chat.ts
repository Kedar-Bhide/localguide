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
      
      // Placeholder - replace with actual Supabase query
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          other_user:profiles!inner(*),
          last_message:messages(*)
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error
      
      set({ chats: data || [], chatsLoading: false })
    } catch (error) {
      console.error('Failed to load chats:', error)
      set({ chats: [], chatsLoading: false })
    }
  },

  loadMessages: async (chatId: string) => {
    try {
      set({ messagesLoading: true })
      
      // Placeholder - replace with actual Supabase query
      const { data, error } = await supabase
        .from('messages')
        .select('*')
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
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds)

      if (error) throw error
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  },

  updateTypingStatus: (chatId: string, typing: boolean, userName?: string) => {
    // Placeholder for typing indicators
    set({ typingUsers: typing ? [{ userName }] : [] })
  }
}))