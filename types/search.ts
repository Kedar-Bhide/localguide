export interface SearchFilters {
  location?: string
  startDate?: string
  endDate?: string
  tags?: string[]
}

export interface SearchSegment {
  id: 'where' | 'dates' | 'interests' | 'search'
  label: string
  placeholder: string
  value?: string
  isEmpty: boolean
}

export interface LocationSuggestion {
  place_id: string
  description: string
  main_text: string
  secondary_text: string
}