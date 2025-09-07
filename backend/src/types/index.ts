// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  city?: string;
  country?: string;
  is_local: boolean;
  tags?: string[];
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

// Local Expert Types
export interface LocalExpert {
  id: string;
  user_id: string;
  city: string;
  country: string;
  bio: string;
  tags: string[];
  is_verified: boolean;
  rating: number;
  total_connections: number;
  languages?: string[];
  created_at: string;
  updated_at: string;
}

// Chat Types
export interface Chat {
  id: string;
  traveler_id: string;
  local_id: string;
  city: string;
  status: 'active' | 'archived';
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'location';
  is_read: boolean;
  created_at: string;
}

export interface ChatParticipant {
  chat_id: string;
  user_id: string;
  role: 'traveler' | 'local';
  joined_at: string;
  last_read_at?: string;
}

// Search Types
export interface SearchQuery {
  location: string;
  city?: string;
  country?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  user_id: string;
  city: string;
  country: string;
  bio: string;
  tags: string[];
  rating: number;
  total_connections: number;
  user: {
    full_name: string;
    avatar_url?: string;
    last_active_at: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  user_type: 'traveler' | 'local';
  city?: string;
  country?: string;
  bio?: string;
  tags?: string[];
}

export interface AuthResponse {
  user: User;
  profile: UserProfile;
  token: string;
  expires_in: number;
}

// Request Extensions
export interface AuthenticatedRequest extends Request {
  user?: User;
  profile?: UserProfile;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

// Socket Types
export interface SocketUser {
  userId: string;
  socketId: string;
  chatRooms: string[];
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  senderName: string;
}