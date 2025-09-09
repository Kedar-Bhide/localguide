// User Types
export interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  bio?: string
  city?: string
  country?: string
  is_local: boolean
  tags?: string[]
  languages?: string[]
  last_active_at?: string
  created_at: string
  updated_at: string
}

// Local Expert Types
export interface LocalExpert {
  id: string
  user_id: string
  city: string
  country: string
  bio: string
  tags: string[]
  languages: string[]
  is_verified: boolean
  rating: number
  total_connections: number
  created_at: string
  updated_at: string
}

export interface SearchResult {
  id: string
  user_id: string
  city: string
  country: string
  bio: string
  tags: string[]
  rating: number
  total_connections: number
  user: {
    full_name: string
    avatar_url?: string
    last_active_at: string
  }
}

// Chat Types
export interface Chat {
  id: string
  traveler_id: string
  local_id: string
  city: string
  status: 'active' | 'archived'
  last_message_at: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  message_type?: 'text' | 'image' | 'location'
  is_read?: boolean
  created_at: string
  sender?: {
    full_name: string
    avatar_url?: string
  }
}

export interface ChatWithDetails {
  id: string
  city: string
  status: string
  last_message_at: string
  created_at: string
  other_user: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  user_role: 'traveler' | 'local'
  last_message?: {
    id: string
    content: string
    sender_id: string
    created_at: string
    is_from_user: boolean
  } | null
  unread_count: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form Types
export interface SignupData {
  email: string
  password: string
  full_name: string
  user_type: 'traveler' | 'local'
  // Local-specific fields (only required if user_type === 'local')
  city?: string
  country?: string
  bio?: string
  tags?: string[]
}

export interface LoginData {
  email: string
  password: string
}

export interface SearchQuery {
  location?: string
  city?: string
  country?: string
  tags?: string[]
  page?: number
  limit?: number
}

// Auth Context Types
export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  login: (data: LoginData) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

// Socket Events
export interface SocketEvents {
  join: (userId: string) => void
  joinChat: (chatId: string) => void
  leaveChat: (chatId: string) => void
  sendMessage: (data: { chatId: string; content: string; messageType?: string }) => void
  newMessage: (message: Message) => void
  typing: (data: { chatId: string; userId: string; userName: string }) => void
  stopTyping: (data: { chatId: string; userId: string }) => void
  userTyping: (data: { userId: string; userName: string }) => void
  userStoppedTyping: (data: { userId: string }) => void
}

// Component Props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}