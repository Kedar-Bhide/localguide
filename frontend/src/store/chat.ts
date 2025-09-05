import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { ChatWithDetails, Message, PaginatedResponse } from '@/types'

interface TypingUser {
  userId: string
  userName: string
}

interface ChatState {
  // Socket connection
  socket: Socket | null
  connected: boolean
  
  // Chats data
  chats: ChatWithDetails[]
  currentChatId: string | null
  currentMessages: Message[]
  messagesLoading: boolean
  chatsLoading: boolean
  
  // Typing indicators
  typingUsers: TypingUser[]
  
  // Pagination
  messagesPagination: {
    page: number
    limit: number
    total: number
    pages: number
  }

  // Actions
  initializeSocket: (userId: string) => void
  disconnectSocket: () => void
  loadChats: () => Promise<void>
  loadMessages: (chatId: string, page?: number) => Promise<void>
  sendMessage: (chatId: string, content: string) => Promise<void>
  setCurrentChat: (chatId: string | null) => void
  markAsRead: (chatId: string, messageIds: string[]) => Promise<void>
  addMessage: (message: Message) => void
  updateTypingStatus: (chatId: string, isTyping: boolean, userName: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  socket: null,
  connected: false,
  chats: [],
  currentChatId: null,
  currentMessages: [],
  messagesLoading: false,
  chatsLoading: false,
  typingUsers: [],
  messagesPagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  },

  // Initialize socket connection
  initializeSocket: (userId: string) => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001', {
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      console.log('Connected to chat server')
      set({ socket, connected: true })
      
      // Join user's personal room
      socket.emit('join', userId)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server')
      set({ connected: false })
    })

    // Listen for new messages
    socket.on('newMessage', (message: Message) => {
      const { currentChatId, addMessage } = get()
      
      addMessage(message)
      
      // Show toast notification if message is not from current chat
      if (message.chat_id !== currentChatId) {
        toast.success(`New message from ${message.sender?.full_name}`)
      }
    })

    // Listen for typing indicators
    socket.on('userTyping', (data: { userId: string; userName: string }) => {
      set(state => ({
        typingUsers: [
          ...state.typingUsers.filter(u => u.userId !== data.userId),
          data
        ]
      }))
    })

    socket.on('userStoppedTyping', (data: { userId: string }) => {
      set(state => ({
        typingUsers: state.typingUsers.filter(u => u.userId !== data.userId)
      }))
    })

    set({ socket })
  },

  // Disconnect socket
  disconnectSocket: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, connected: false })
    }
  },

  // Load user's chats
  loadChats: async () => {
    try {
      set({ chatsLoading: true })
      const chats = await api.getUserChats()
      set({ chats, chatsLoading: false })
    } catch (error) {
      console.error('Failed to load chats:', error)
      set({ chatsLoading: false })
    }
  },

  // Load messages for a specific chat
  loadMessages: async (chatId: string, page = 1) => {
    try {
      set({ messagesLoading: true })
      const response: PaginatedResponse<Message> = await api.getChatMessages(chatId, page, 50)
      
      const { currentMessages } = get()
      const newMessages = page === 1 
        ? response.data.reverse() 
        : [...response.data.reverse(), ...currentMessages]

      set({
        currentMessages: newMessages,
        messagesPagination: response.pagination,
        messagesLoading: false
      })

      // Join chat room for real-time updates
      const { socket } = get()
      if (socket) {
        socket.emit('joinChat', chatId)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      set({ messagesLoading: false })
    }
  },

  // Send a message
  sendMessage: async (chatId: string, content: string) => {
    try {
      const message = await api.sendMessage(chatId, content.trim())
      
      // Add message to current messages
      set(state => ({
        currentMessages: [...state.currentMessages, message]
      }))

      // Emit to socket for real-time delivery
      const { socket } = get()
      if (socket) {
        socket.emit('sendMessage', {
          chatId,
          content: content.trim(),
          messageType: 'text'
        })
      }

      // Update chat list with new last message
      set(state => ({
        chats: state.chats.map(chat => 
          chat.id === chatId
            ? {
                ...chat,
                last_message: {
                  id: message.id,
                  content: message.content,
                  sender_id: message.sender_id,
                  created_at: message.created_at,
                  is_from_user: true
                },
                last_message_at: message.created_at
              }
            : chat
        )
      }))
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  },

  // Set current chat
  setCurrentChat: (chatId: string | null) => {
    const { socket, currentChatId } = get()
    
    // Leave previous chat room
    if (socket && currentChatId && currentChatId !== chatId) {
      socket.emit('leaveChat', currentChatId)
    }
    
    set({ 
      currentChatId: chatId,
      currentMessages: [],
      messagesPagination: { page: 1, limit: 50, total: 0, pages: 0 }
    })

    // Load messages for new chat
    if (chatId) {
      get().loadMessages(chatId)
    }
  },

  // Mark messages as read
  markAsRead: async (chatId: string, messageIds: string[]) => {
    try {
      await api.markMessagesAsRead(chatId, messageIds)
      
      // Update local state
      set(state => ({
        currentMessages: state.currentMessages.map(msg =>
          messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        ),
        chats: state.chats.map(chat =>
          chat.id === chatId ? { ...chat, unread_count: 0 } : chat
        )
      }))
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  },

  // Add new message to current chat
  addMessage: (message: Message) => {
    const { currentChatId } = get()
    
    if (message.chat_id === currentChatId) {
      set(state => ({
        currentMessages: [...state.currentMessages, message]
      }))
    }

    // Update chat list
    set(state => ({
      chats: state.chats.map(chat => 
        chat.id === message.chat_id
          ? {
              ...chat,
              last_message: {
                id: message.id,
                content: message.content,
                sender_id: message.sender_id,
                created_at: message.created_at,
                is_from_user: false
              },
              last_message_at: message.created_at,
              unread_count: message.chat_id === currentChatId ? 0 : chat.unread_count + 1
            }
          : chat
      )
    }))
  },

  // Update typing status
  updateTypingStatus: (chatId: string, isTyping: boolean, userName: string) => {
    const { socket, currentChatId } = get()
    
    if (socket && chatId === currentChatId) {
      if (isTyping) {
        socket.emit('typing', {
          chatId,
          userId: 'current-user', // This should come from auth store
          userName
        })
      } else {
        socket.emit('stopTyping', {
          chatId,
          userId: 'current-user'
        })
      }
    }
  }
}))