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

export const createChat = async (travelerId: string, localId: string, city: string) => {
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id')
    .eq('traveler_id', travelerId)
    .eq('local_id', localId)
    .eq('city', city)
    .single()

  if (existingChat) {
    return existingChat
  }

  const { data, error } = await supabase
    .from('chats')
    .insert([
      {
        traveler_id: travelerId,
        local_id: localId,
        city
      }
    ])
    .select()
    .single()

  if (error) throw error

  await supabase
    .from('chat_participants')
    .insert([
      {
        chat_id: data.id,
        user_id: travelerId,
        role: 'traveler'
      },
      {
        chat_id: data.id,
        user_id: localId,
        role: 'local'
      }
    ])

  return data
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