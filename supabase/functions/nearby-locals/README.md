# Nearby Locals Edge Function

A Supabase Edge Function that finds nearby cities with local experts using Google Places API and Supabase database queries.

## Overview

This edge function accepts a city and country as input, uses Google Places API to find up to 10 nearby cities, then queries the Supabase database to count how many local experts are available in each city. It returns the top 3 cities with the highest number of locals.

## API Reference

### Endpoint
```
POST /functions/v1/nearby-locals
```

### Request Body
```json
{
  "city": "San Francisco",
  "country": "USA"
}
```

### Response Format
```json
{
  "original_query": {
    "city": "San Francisco",
    "country": "USA"
  },
  "nearby_cities": [
    {
      "city": "Oakland",
      "country": "USA",
      "local_count": 5
    },
    {
      "city": "Berkeley",
      "country": "USA", 
      "local_count": 3
    },
    {
      "city": "San Jose",
      "country": "USA",
      "local_count": 2
    }
  ],
  "total_found": 3
}
```

### Error Responses

**400 Bad Request**
```json
{
  "error": "Both city and country are required",
  "example": { "city": "San Francisco", "country": "USA" }
}
```

**500 Internal Server Error**
```json
{
  "error": "Google Places API not configured"
}
```

## Environment Variables

The following environment variables must be configured in Supabase:

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_PLACES_API_KEY` | Google Places API key for nearby city search | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for database access | Yes |

## Google Places API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API** 
4. Create credentials (API Key)
5. Restrict the API key to only allow Places API access
6. Add the API key to your Supabase environment variables

## Database Requirements

The function queries the `locals` table with the following structure:
```sql
CREATE TABLE locals (
  user_id UUID PRIMARY KEY,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  -- other fields...
);
```

## Deployment

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Authenticated with Supabase: `supabase login`
- Linked to your project: `supabase link --project-ref YOUR_PROJECT_REF`

### Deploy Command
```bash
# From the project root directory
supabase functions deploy nearby-locals

# Or deploy all functions
supabase functions deploy
```

### Local Development
```bash
# Start local Supabase stack
supabase start

# Serve functions locally
supabase functions serve nearby-locals --env-file supabase/.env.local

# Test the function
curl -X POST 'http://localhost:54321/functions/v1/nearby-locals' \\
  -H 'Authorization: Bearer YOUR_ANON_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "city": "San Francisco", 
    "country": "USA"
  }'
```

### Environment Variables Setup

Add environment variables in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Settings → Edge Functions
3. Add the required environment variables:
   - `GOOGLE_PLACES_API_KEY`
   - `SUPABASE_URL` (usually auto-configured)
   - `SUPABASE_SERVICE_ROLE_KEY` (usually auto-configured)

Or use the CLI:
```bash
supabase secrets set GOOGLE_PLACES_API_KEY=your_api_key_here
```

## Function Logic

1. **Input Validation**: Validates required city and country parameters
2. **Google Places Query**: Searches for "cities near {city} {country}" using Google Places Text Search API
3. **City Processing**: Extracts city names and countries from Google Places results
4. **Database Queries**: For each nearby city, counts locals using Supabase with exact count queries
5. **Filtering & Sorting**: Only includes cities with locals, sorts by local count (highest first)
6. **Response**: Returns top 3 cities with their local counts

## Rate Limits & Costs

- **Google Places API**: Has usage quotas and costs per request
- **Supabase Edge Functions**: Free tier includes 500,000 function invocations/month
- **Database Queries**: Each nearby city requires a count query to the `locals` table

## Testing

Test the function with different scenarios:

```bash
# Test with a major city (should return results)
curl -X POST 'https://your-project.supabase.co/functions/v1/nearby-locals' \\
  -H 'Authorization: Bearer YOUR_ANON_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"city": "New York", "country": "USA"}'

# Test with a remote location (may return empty results)
curl -X POST 'https://your-project.supabase.co/functions/v1/nearby-locals' \\
  -H 'Authorization: Bearer YOUR_ANON_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"city": "Remote Town", "country": "Antarctica"}'

# Test error handling (missing parameters)
curl -X POST 'https://your-project.supabase.co/functions/v1/nearby-locals' \\
  -H 'Authorization: Bearer YOUR_ANON_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"city": "Test"}'
```

## Manual Steps Required in Supabase

After deploying the function, complete these manual steps in the Supabase dashboard:

1. **Enable the Function**:
   - Go to Edge Functions in your Supabase dashboard
   - Find the `nearby-locals` function
   - Ensure it's enabled and deployed

2. **Set Environment Variables**:
   - Navigate to Settings → Edge Functions → Environment Variables
   - Add `GOOGLE_PLACES_API_KEY` with your Google Places API key
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

3. **Test the Deployment**:
   - Use the built-in function testing interface
   - Or test via API calls as shown in the Testing section

4. **Monitor Function Logs**:
   - Check the function logs for any deployment or runtime errors
   - Verify Google Places API calls are working
   - Ensure database queries are returning expected results

## Troubleshooting

**Common Issues:**

1. **Google Places API Errors**:
   - Verify API key is correct and has Places API enabled
   - Check API quotas and billing setup
   - Ensure API key restrictions allow your Supabase domain

2. **Database Connection Issues**:
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
   - Check if RLS policies allow the function to query the `locals` table

3. **No Results Returned**:
   - The input location might not have nearby cities with locals
   - Google Places might not find relevant cities for the query
   - Database might not have local experts in nearby cities

4. **Function Timeout**:
   - Google Places API calls might be slow
   - Multiple database queries might exceed function timeout
   - Consider optimizing the number of cities processed

## Architecture Notes

- The function prioritizes accuracy over speed by using exact count queries
- Cities are deduplicated to avoid processing the same city multiple times
- The function gracefully handles API errors and returns partial results when possible
- Logging is comprehensive to aid in debugging and monitoring