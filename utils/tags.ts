import { supabase } from '../lib/supabase'

export interface Tag {
  id: string
  name: string
  category?: string
  description?: string
  is_popular?: boolean
}

export async function fetchTags(): Promise<Tag[]> {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, category, description, is_popular')
      .order('is_popular', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching tags:', error)
      return getMockTags() // Fallback to mock data
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchTags:', error)
    return getMockTags() // Fallback to mock data
  }
}

// Mock tags for development/fallback
export function getMockTags(): Tag[] {
  return [
    // Food & Dining
    { id: '1', name: 'Local Restaurants', category: 'Food & Dining', is_popular: true },
    { id: '2', name: 'Food Tours', category: 'Food & Dining', is_popular: true },
    { id: '3', name: 'Street Food', category: 'Food & Dining', is_popular: true },
    { id: '4', name: 'Fine Dining', category: 'Food & Dining' },
    { id: '5', name: 'Cooking Classes', category: 'Food & Dining' },
    { id: '6', name: 'Wine Tasting', category: 'Food & Dining' },
    { id: '7', name: 'Coffee Culture', category: 'Food & Dining' },
    { id: '8', name: 'Vegetarian Options', category: 'Food & Dining' },
    { id: '9', name: 'Seafood', category: 'Food & Dining' },
    { id: '10', name: 'Desserts', category: 'Food & Dining' },
    
    // Activities & Experiences  
    { id: '11', name: 'Outdoor Adventures', category: 'Activities & Experiences', is_popular: true },
    { id: '12', name: 'Hiking', category: 'Activities & Experiences', is_popular: true },
    { id: '13', name: 'Biking', category: 'Activities & Experiences' },
    { id: '14', name: 'Water Sports', category: 'Activities & Experiences' },
    { id: '15', name: 'Beach Activities', category: 'Activities & Experiences' },
    { id: '16', name: 'Winter Sports', category: 'Activities & Experiences' },
    { id: '17', name: 'Photography', category: 'Activities & Experiences', is_popular: true },
    { id: '18', name: 'Art Galleries', category: 'Activities & Experiences' },
    { id: '19', name: 'Museums', category: 'Activities & Experiences' },
    { id: '20', name: 'Historical Sites', category: 'Activities & Experiences', is_popular: true },
    { id: '21', name: 'Architecture', category: 'Activities & Experiences' },
    
    // Entertainment & Culture
    { id: '22', name: 'Nightlife', category: 'Entertainment & Culture', is_popular: true },
    { id: '23', name: 'Live Music', category: 'Entertainment & Culture', is_popular: true },
    { id: '24', name: 'Theater', category: 'Entertainment & Culture' },
    { id: '25', name: 'Festivals', category: 'Entertainment & Culture' },
    { id: '26', name: 'Local Events', category: 'Entertainment & Culture' },
    { id: '27', name: 'Markets', category: 'Entertainment & Culture' },
    { id: '28', name: 'Shopping', category: 'Entertainment & Culture' },
    { id: '29', name: 'Cultural Experiences', category: 'Entertainment & Culture', is_popular: true },
    { id: '30', name: 'Language Practice', category: 'Entertainment & Culture' },
    { id: '31', name: 'Traditional Crafts', category: 'Entertainment & Culture' },
    
    // Wellness & Relaxation
    { id: '32', name: 'Spas & Wellness', category: 'Wellness & Relaxation' },
    { id: '33', name: 'Yoga', category: 'Wellness & Relaxation' },
    { id: '34', name: 'Meditation', category: 'Wellness & Relaxation' },
    { id: '35', name: 'Nature Walks', category: 'Wellness & Relaxation' },
    { id: '36', name: 'Parks & Gardens', category: 'Wellness & Relaxation' },
    { id: '37', name: 'Hot Springs', category: 'Wellness & Relaxation' },
    
    // Practical & Transportation
    { id: '38', name: 'Hidden Gems', category: 'Practical', is_popular: true },
    { id: '39', name: 'Local Transportation', category: 'Practical' },
    { id: '40', name: 'Budget-Friendly', category: 'Practical', is_popular: true },
    { id: '41', name: 'Luxury Experiences', category: 'Practical' },
    { id: '42', name: 'Family-Friendly', category: 'Practical', is_popular: true },
    { id: '43', name: 'Pet-Friendly', category: 'Practical' },
    { id: '44', name: 'Accessibility', category: 'Practical' },
    { id: '45', name: 'Public Transport', category: 'Practical' }
  ]
}