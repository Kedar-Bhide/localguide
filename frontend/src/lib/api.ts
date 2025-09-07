import { supabase } from '@/lib/supabase'
import type { SearchQuery, SearchResult } from '@/types'

class APIClient {
  async searchLocalExperts(query: SearchQuery) {
    try {
      let supabaseQuery = supabase
        .from('locals')
        .select(`
          user_id,
          city,
          country,
          bio,
          tags,
          created_at,
          user:profiles(
            full_name,
            avatar_url,
            last_active_at
          )
        `)

      // Apply filters
      if (query.city) {
        supabaseQuery = supabaseQuery.ilike('city', `%${query.city}%`)
      }

      if (query.tags && query.tags.length > 0) {
        supabaseQuery = supabaseQuery.contains('tags', query.tags)
      }

      // Apply pagination
      const from = ((query.page || 1) - 1) * (query.limit || 12)
      const to = from + (query.limit || 12) - 1

      const { data, error, count } = await supabaseQuery
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match SearchResult interface
      const transformedData = data?.map(item => ({
        id: item.user_id, // Use user_id as the id for the local expert
        user_id: item.user_id,
        city: item.city,
        country: item.country,
        bio: item.bio,
        tags: item.tags || [],
        rating: 4.5, // Default rating - will need to implement rating system later
        total_connections: 0, // Default connections - will need to implement later
        user: (Array.isArray(item.user) ? item.user[0] : item.user) || {
          full_name: 'Unknown User',
          avatar_url: undefined,
          last_active_at: new Date().toISOString()
        }
      })).filter(item => item.user) || []

      return {
        data: transformedData,
        pagination: {
          page: query.page || 1,
          limit: query.limit || 12,
          total: count || 0,
          pages: Math.ceil((count || 0) / (query.limit || 12))
        }
      }
    } catch (error) {
      console.error('API Error - searchLocalExperts:', error)
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          pages: 0
        }
      }
    }
  }

  async getCities() {
    try {
      const { data, error } = await supabase
        .from('locals')
        .select('city, country')
        .order('city')

      if (error) throw error

      // Remove duplicates and filter out undefined values
      const uniqueCities = Array.from(
        new Set(data?.filter(item => item.city && item.country).map(item => `${item.city}-${item.country}`))
      ).map(key => {
        const [city, country] = key.split('-')
        return { city: city!, country: country! }
      })

      return uniqueCities
    } catch (error) {
      console.error('API Error - getCities:', error)
      return []
    }
  }

  async createChat(localUserId: string, city: string) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('chats')
        .insert({
          user1_id: user.user.id,
          user2_id: localUserId,
          city,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('API Error - createChat:', error)
      throw error
    }
  }
}

const api = new APIClient()
export default api