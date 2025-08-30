import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NearbyRequest {
  city: string
  country: string
  radius_km?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { city, country, radius_km = 50 }: NearbyRequest = await req.json()
    
    if (!city || !country) {
      return new Response(
        JSON.stringify({ error: 'City and country are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Google Places API key from environment
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!googleApiKey) {
      throw new Error('Google Places API key not configured')
    }

    // Use Google Places API to find nearby cities
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=cities+near+${encodeURIComponent(city)}+${encodeURIComponent(country)}&type=locality&radius=${radius_km * 1000}&key=${googleApiKey}`
    
    const placesResponse = await fetch(placesUrl)
    const placesData = await placesResponse.json()

    if (placesData.status !== 'OK') {
      console.error('Google Places API error:', placesData)
      return new Response(
        JSON.stringify({ error: 'Unable to find nearby cities', cities: [] }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract city names from Google Places results
    const nearbyCities = placesData.results
      .slice(0, 10) // Limit to 10 nearby cities
      .map((place: any) => {
        // Extract city name from formatted_address
        const addressParts = place.formatted_address.split(', ')
        return {
          city: place.name,
          formatted_address: place.formatted_address,
          // Try to extract country from address parts
          country: addressParts[addressParts.length - 1] || country
        }
      })
      .filter((city: any) => city.city.toLowerCase() !== city.toLowerCase()) // Exclude original city

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check which nearby cities have locals
    const citiesWithLocals = []
    
    for (const nearbyCity of nearbyCities) {
      const { data: locals, error } = await supabase
        .from('locals')
        .select('city, country, user_id')
        .ilike('city', nearbyCity.city)
        .ilike('country', nearbyCity.country)
        .limit(1)

      if (!error && locals && locals.length > 0) {
        citiesWithLocals.push({
          city: nearbyCity.city,
          country: nearbyCity.country,
          formatted_address: nearbyCity.formatted_address,
          locals_count: locals.length
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        original_query: { city, country },
        nearby_cities: citiesWithLocals,
        total_found: citiesWithLocals.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in nearby-locals function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})