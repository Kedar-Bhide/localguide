import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NearbyRequest {
  city: string
  country: string
}

interface NearbyCity {
  city: string
  country: string
  local_count: number
}

interface GooglePlacesResult {
  name: string
  formatted_address: string
  place_id: string
}

interface GooglePlacesResponse {
  results: GooglePlacesResult[]
  status: string
  error_message?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse and validate request body
    const body = await req.json().catch(() => ({}))
    const { city, country }: NearbyRequest = body
    
    if (!city || !country) {
      return new Response(
        JSON.stringify({ 
          error: 'Both city and country are required',
          example: { city: 'San Francisco', country: 'USA' }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate environment variables
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!googleApiKey) {
      console.error('GOOGLE_PLACES_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Google Places API not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing')
      return new Response(
        JSON.stringify({ error: 'Database configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Finding nearby cities for: ${city}, ${country}`)

    // Use Google Places Text Search API to find nearby cities
    const searchQuery = `cities near ${city} ${country}`
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
      `query=${encodeURIComponent(searchQuery)}&` +
      `type=locality&` +
      `key=${googleApiKey}`

    console.log('Calling Google Places API...')
    const placesResponse = await fetch(placesUrl)
    
    if (!placesResponse.ok) {
      throw new Error(`Google Places API HTTP error: ${placesResponse.status}`)
    }

    const placesData: GooglePlacesResponse = await placesResponse.json()

    if (placesData.status !== 'OK') {
      console.error('Google Places API error:', placesData)
      
      // Return empty result for API errors, but don't fail the request
      return new Response(
        JSON.stringify({
          original_query: { city, country },
          nearby_cities: [],
          total_found: 0,
          message: placesData.error_message || 'No nearby cities found'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${placesData.results.length} places from Google`)

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Process nearby cities (limit to top 10 from Google, return top 3 with locals)
    const nearbyCitiesWithLocals: NearbyCity[] = []
    const processedCities = new Set<string>() // Avoid duplicates
    
    for (const place of placesData.results.slice(0, 10)) {
      try {
        // Extract city and country from Google Places result
        const cityName = place.name.trim()
        const addressParts = place.formatted_address.split(', ')
        
        // Try to extract country - usually the last part of formatted_address
        let extractedCountry = country // Default to input country
        if (addressParts.length > 1) {
          const lastPart = addressParts[addressParts.length - 1].trim()
          // If it looks like a country (not a postal code), use it
          if (lastPart.length > 2 && !/^\d/.test(lastPart)) {
            extractedCountry = lastPart
          }
        }

        // Skip if same as input city or already processed
        const cityKey = `${cityName.toLowerCase()}-${extractedCountry.toLowerCase()}`
        const inputKey = `${city.toLowerCase()}-${country.toLowerCase()}`
        
        if (cityKey === inputKey || processedCities.has(cityKey)) {
          continue
        }
        processedCities.add(cityKey)

        console.log(`Checking locals for: ${cityName}, ${extractedCountry}`)

        // Query Supabase for local count in this city
        const { count, error } = await supabase
          .from('locals')
          .select('*', { count: 'exact', head: true })
          .ilike('city', cityName)
          .ilike('country', extractedCountry)

        if (error) {
          console.error(`Error querying locals for ${cityName}:`, error)
          continue
        }

        const localCount = count || 0
        console.log(`Found ${localCount} locals in ${cityName}, ${extractedCountry}`)

        // Only include cities that have locals
        if (localCount > 0) {
          nearbyCitiesWithLocals.push({
            city: cityName,
            country: extractedCountry,
            local_count: localCount
          })
        }

        // Stop once we have 3 cities with locals
        if (nearbyCitiesWithLocals.length >= 3) {
          break
        }

      } catch (error) {
        console.error(`Error processing place ${place.name}:`, error)
        continue
      }
    }

    // Sort by local count (highest first) and limit to 3
    nearbyCitiesWithLocals.sort((a, b) => b.local_count - a.local_count)
    const topCities = nearbyCitiesWithLocals.slice(0, 3)

    console.log(`Returning ${topCities.length} cities with locals`)

    return new Response(
      JSON.stringify({ 
        original_query: { city, country },
        nearby_cities: topCities,
        total_found: topCities.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in nearby-locals function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})