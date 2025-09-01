import Card from './Card'

interface NearbyCity {
  city: string
  country: string
  local_count: number
}

interface NearbyBannerProps {
  cities: NearbyCity[]
  loading?: boolean
  onCityClick: (city: NearbyCity) => void
}

export default function NearbyBanner({ cities, loading = false, onCityClick }: NearbyBannerProps) {
  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Finding nearby cities with local experts...</span>
          </div>
        </div>
      </Card>
    )
  }

  if (!cities || cities.length === 0) {
    return null
  }

  return (
    <Card>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Local experts in nearby cities</h3>
              <p className="text-sm text-gray-600">
                We found {cities.length} nearby {cities.length === 1 ? 'city' : 'cities'} with available experts
              </p>
            </div>
          </div>
        </div>
        
        {/* Cities Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city, index) => (
            <button
              key={index}
              onClick={() => onCityClick(city)}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-700 truncate">
                    {city.city}, {city.country}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {city.local_count} local expert{city.local_count !== 1 ? 's' : ''} available
                  </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Footer hint */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Click on any city to view available local experts in that area
          </p>
        </div>
      </div>
    </Card>
  )
}