import { supabase } from '../lib/supabase'
import type { Local, Chat, Message, Search, Feedback, LocalSearchResult } from '../types'

export const createUserProfile = async (userId: string, fullName: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert([
      {
        id: userId,
        full_name: fullName,
        is_traveler: true,
        is_local: false
      }
    ])
    .select()
  
  if (error) throw error
  return data
}

export const upgradeToLocal = async (userId: string, localData: Omit<Local, 'id' | 'user_id' | 'created_at'>) => {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .update({ is_local: true })
    .eq('id', userId)
  
  if (profileError) throw profileError

  const { data, error } = await supabase
    .from('locals')
    .upsert([
      {
        user_id: userId,
        ...localData
      }
    ])
    .select()
  
  if (error) throw error
  return data
}

export const searchLocals = async (city: string, country: string, tags?: string[]): Promise<LocalSearchResult[]> => {
  let query = supabase
    .from('locals')
    .select(`
      *,
      user:profiles (full_name, avatar_url)
    `)
    .eq('city', city)
    .eq('country', country)

  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  const { data, error } = await query

  if (error) throw error
  return data as LocalSearchResult[]
}

export const searchLocalsRanked = async (city: string, country: string, tags?: string[]): Promise<LocalSearchResult[]> => {
  const { data, error } = await supabase.rpc('search_locals', {
    query_city: city,
    query_country: country,
    selected_tags: tags || []
  })

  if (error) throw error
  
  // Transform the data to match LocalSearchResult interface
  const transformedData = data.map((item: any) => ({
    id: item.user_id, // Using user_id as the local record id
    user_id: item.user_id,
    location: `${item.city}, ${item.state ? item.state + ', ' : ''}${item.country}`,
    city: item.city,
    country: item.country,
    bio: item.bio,
    tags: item.tags,
    created_at: new Date().toISOString(), // Placeholder
    user: {
      full_name: item.full_name,
      avatar_url: item.avatar_url
    }
  }))

  return transformedData as LocalSearchResult[]
}

export const searchLocalsSorted = async (
  city: string, 
  country: string, 
  tags?: string[], 
  sortBy: 'best_match' | 'most_active' = 'best_match'
): Promise<LocalSearchResult[]> => {
  // Get the raw data from the RPC function
  const { data, error } = await supabase.rpc('search_locals', {
    query_city: city,
    query_country: country,
    selected_tags: tags || []
  })

  if (error) throw error
  
  // Transform the data
  let transformedData = data.map((item: any) => ({
    id: item.user_id,
    user_id: item.user_id,
    location: `${item.city}, ${item.state ? item.state + ', ' : ''}${item.country}`,
    city: item.city,
    country: item.country,
    bio: item.bio,
    tags: item.tags,
    created_at: new Date().toISOString(),
    user: {
      full_name: item.full_name,
      avatar_url: item.avatar_url,
      last_active_at: item.last_active_at
    }
  }))

  // Apply sorting
  if (sortBy === 'most_active') {
    transformedData = transformedData.sort((a, b) => {
      const dateA = a.user.last_active_at ? new Date(a.user.last_active_at).getTime() : 0
      const dateB = b.user.last_active_at ? new Date(b.user.last_active_at).getTime() : 0
      return dateB - dateA // Most recent first
    })
  }
  // 'best_match' uses the default sorting from the RPC function (tag overlap + last_active_at)

  return transformedData as LocalSearchResult[]
}

export const findOrCreateChat = async (travelerId: string, localId: string, city: string) => {
  // First, check if a chat already exists between these two users for this city
  const { data: existingChat, error: searchError } = await supabase
    .from('chats')
    .select(`
      id,
      city,
      created_at,
      last_message_at,
      chat_participants!inner (
        user_id,
        role
      )
    `)
    .eq('city', city)
    .in('chat_participants.user_id', [travelerId, localId])

  if (searchError) throw searchError

  // Check if we found a chat with both participants
  const chatWithBothUsers = existingChat?.find(chat => {
    const participants = chat.chat_participants
    const hasTraverl = participants.some((p: any) => p.user_id === travelerId && p.role === 'traveler')
    const hasLocal = participants.some((p: any) => p.user_id === localId && p.role === 'local')
    return hasTraverl && hasLocal && participants.length === 2
  })

  if (chatWithBothUsers) {
    return { id: chatWithBothUsers.id, created_at: chatWithBothUsers.created_at }
  }

  // No existing chat found, create a new one
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert([
      {
        city,
        last_message_at: null
      }
    ])
    .select()
    .single()

  if (createError) throw createError

  // Insert chat participants - must be done by each user separately due to RLS
  // First insert the current user (traveler)
  const { error: travelerParticipantError } = await supabase
    .from('chat_participants')
    .insert([
      {
        chat_id: newChat.id,
        user_id: travelerId,
        role: 'traveler'
      }
    ])

  if (travelerParticipantError) throw travelerParticipantError

  // Note: The local user will need to be added when they first access the chat
  // or via a service role function. For now, we'll use service role behavior
  const { error: localParticipantError } = await supabase
    .from('chat_participants')
    .insert([
      {
        chat_id: newChat.id,
        user_id: localId,
        role: 'local'
      }
    ])

  if (localParticipantError) throw localParticipantError

  return newChat
}

export const createChat = async (travelerId: string, localId: string, city: string) => {
  return findOrCreateChat(travelerId, localId, city)
}

export const getChatDetails = async (chatId: string) => {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      city,
      created_at,
      last_message_at,
      chat_participants (
        user_id,
        role,
        user:profiles!user_id (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('id', chatId)
    .single()

  if (error) throw error
  return data
}

export const getMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      sender_id,
      sender:profiles!sender_id (
        full_name,
        avatar_url
      )
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export const getUserActiveChats = async (userId: string) => {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      city,
      created_at,
      last_message_at,
      chat_participants!inner (
        user_id,
        role,
        user:profiles!user_id (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('chat_participants.user_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) throw error

  // Transform the data to include other participant info
  const activeChats = data.map(chat => {
    const otherParticipant = chat.chat_participants.find((p: any) => p.user_id !== userId)
    const user = Array.isArray(otherParticipant?.user) ? otherParticipant?.user[0] : otherParticipant?.user
    
    return {
      id: chat.id,
      city: chat.city,
      created_at: chat.created_at,
      last_message_at: chat.last_message_at,
      other_participant: otherParticipant ? {
        name: user?.full_name || 'Unknown User',
        avatar_url: user?.avatar_url,
        role: otherParticipant.role
      } : null
    }
  })

  return activeChats
}

export const getUserChatsWithMessages = async (userId: string) => {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      city,
      created_at,
      last_message_at,
      last_message,
      chat_participants!inner (
        user_id,
        role,
        user:profiles!user_id (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('chat_participants.user_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) throw error

  // Transform the data to include other participant info and last message
  const chatsWithMessages = data.map(chat => {
    const otherParticipant = chat.chat_participants.find((p: any) => p.user_id !== userId)
    const user = Array.isArray(otherParticipant?.user) ? otherParticipant?.user[0] : otherParticipant?.user
    
    return {
      id: chat.id,
      city: chat.city,
      created_at: chat.created_at,
      last_message_at: chat.last_message_at,
      last_message: chat.last_message,
      other_participant: otherParticipant ? {
        name: user?.full_name || 'Unknown User',
        avatar_url: user?.avatar_url,
        role: otherParticipant.role
      } : null,
      // Generate conversation title
      title: `${chat.city} chat with ${user?.full_name || 'Unknown User'}`
    }
  })

  return chatsWithMessages
}

export const sendMessage = async (chatId: string, senderId: string, content: string) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        chat_id: chatId,
        sender_id: senderId,
        content
      }
    ])
    .select()
    .single()

  if (error) throw error

  await supabase
    .from('chats')
    .update({
      last_message: content,
      last_message_at: new Date().toISOString()
    })
    .eq('id', chatId)

  return data
}

export const logSearch = async (userId: string, searchData: Omit<Search, 'id' | 'user_id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('searches')
    .insert([
      {
        user_id: userId,
        ...searchData
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export const submitFeedback = async (feedbackData: Omit<Feedback, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert([feedbackData])
    .select()
    .single()

  if (error) throw error
  return data
}

export interface NearbyCity {
  city: string
  country: string
  local_count: number
}

export interface NearbyLocalsResponse {
  original_query: {
    city: string
    country: string
  }
  nearby_cities: NearbyCity[]
  total_found: number
}

export const getNearbyLocals = async (city: string, country: string): Promise<NearbyCity[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('nearby-locals', {
      body: {
        city,
        country
      }
    })

    if (error) {
      console.error('Error calling nearby-locals function:', error)
      return []
    }

    const response: NearbyLocalsResponse = data
    return response.nearby_cities || []
  } catch (error) {
    console.error('Error fetching nearby locals:', error)
    return []
  }
}