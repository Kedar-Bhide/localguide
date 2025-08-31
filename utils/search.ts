import { supabase } from '../lib/supabase'

interface SearchData {
  location: string
  startDate: string
  endDate: string
  selectedTags: string[]
}

interface ParsedLocation {
  city: string
  state: string | null
  country: string
}

// Parse location string (e.g., "New York, NY, USA") into components
export const parseLocation = (location: string): ParsedLocation => {
  const parts = location.split(',').map(part => part.trim())
  
  if (parts.length >= 3) {
    return {
      city: parts[0],
      state: parts[1],
      country: parts[2]
    }
  } else if (parts.length === 2) {
    return {
      city: parts[0],
      state: null,
      country: parts[1]
    }
  } else {
    return {
      city: parts[0] || location,
      state: null,
      country: 'USA' // Default for single-part locations
    }
  }
}

// Save search to database and return search ID
export const saveSearch = async (searchData: SearchData, userId: string): Promise<string> => {
  const parsedLocation = parseLocation(searchData.location)
  
  const { data, error } = await supabase
    .from('searches')
    .insert({
      user_id: userId,
      query_city: parsedLocation.city,
      query_state: parsedLocation.state,
      query_country: parsedLocation.country,
      start_date: searchData.startDate || null,
      end_date: searchData.endDate || null,
      tags: searchData.selectedTags
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to save search: ${error.message}`)
  }

  return data.id
}

// Build search params for navigation
export const buildSearchParams = (searchData: SearchData, searchId?: string) => {
  const params = new URLSearchParams()
  
  params.set('location', searchData.location)
  if (searchData.startDate) params.set('startDate', searchData.startDate)
  if (searchData.endDate) params.set('endDate', searchData.endDate)
  if (searchData.selectedTags.length > 0) params.set('tags', searchData.selectedTags.join(','))
  if (searchId) params.set('searchId', searchId)
  
  return params.toString()
}