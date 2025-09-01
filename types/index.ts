export interface User {
  id: string;
  full_name: string;
  email: string;
  is_traveler: boolean;
  is_local: boolean;
  created_at: string;
  avatar_url?: string;
}

export interface Local {
  id: string;
  user_id: string;
  location: string;
  city: string;
  country: string;
  bio: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface Chat {
  id: string;
  traveler_id: string;
  local_id: string;
  city: string;
  created_at: string;
  last_message?: string;
  last_message_at?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'traveler' | 'local';
  joined_at: string;
}

export interface Search {
  id: string;
  user_id: string;
  query: string;
  location: string;
  city: string;
  country: string;
  dates?: string;
  tags?: string[];
  results_count: number;
  created_at: string;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  comment: string;
  created_at: string;
}

export interface SearchFilters {
  location: string;
  dates?: string;
  tags?: string[];
}

export interface LocalSearchResult extends Local {
  user: Pick<User, 'full_name' | 'avatar_url'> & {
    last_active_at?: string;
  };
}

export interface LocalCardData {
  id: string;
  user_id: string;
  city: string;
  country: string;
  bio: string;
  tags: string[];
  user: {
    full_name: string;
    avatar_url?: string;
    last_active_at?: string;
  };
}