import axios, { AxiosInstance, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'
import type {
  User,
  UserProfile,
  SignupData,
  LoginData,
  SearchQuery,
  SearchResult,
  ChatWithDetails,
  Message,
  ApiResponse,
  PaginatedResponse
} from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.error || 'Something went wrong'
        
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
            localStorage.removeItem('user_profile')
            window.location.href = '/auth/login'
          }
        }
        
        // Don't show toast for expected errors that components handle
        if (!error.config?.skipToast) {
          toast.error(message)
        }
        
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async signup(data: SignupData): Promise<{ user: User; profile: UserProfile; token: string }> {
    const response = await this.client.post<ApiResponse<{ user: User; profile: UserProfile; token: string }>>(
      '/auth/signup',
      data
    )
    return response.data.data!
  }

  async login(data: LoginData): Promise<{ user: User; profile: UserProfile; token: string }> {
    const response = await this.client.post<ApiResponse<{ user: User; profile: UserProfile; token: string }>>(
      '/auth/login',
      data
    )
    return response.data.data!
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get<ApiResponse<UserProfile>>('/auth/profile')
    return response.data.data!
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.client.put<ApiResponse<UserProfile>>('/auth/profile', data)
    return response.data.data!
  }

  async getCurrentUser(): Promise<{ user: User; profile: UserProfile }> {
    const response = await this.client.get<ApiResponse<{ user: User; profile: UserProfile }>>('/auth/me')
    return response.data.data!
  }

  // Local experts endpoints
  async createLocalProfile(data: any): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>('/locals/profile', data)
    return response.data.data!
  }

  async updateLocalProfile(data: any): Promise<any> {
    const response = await this.client.put<ApiResponse<any>>('/locals/profile', data)
    return response.data.data!
  }

  async searchLocalExperts(query: SearchQuery): Promise<PaginatedResponse<SearchResult>> {
    const params = new URLSearchParams()
    if (query.city) params.append('city', query.city)
    if (query.country) params.append('country', query.country)
    if (query.location) params.append('location', query.location)
    if (query.tags?.length) params.append('tags', query.tags.join(','))
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())

    const response = await this.client.get<ApiResponse<SearchResult[]>>(`/locals/search?${params}`)
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    }
  }

  async getLocalExpert(id: string): Promise<SearchResult> {
    const response = await this.client.get<ApiResponse<SearchResult>>(`/locals/${id}`)
    return response.data.data!
  }

  async getNearbyLocals(city: string, country: string): Promise<any[]> {
    const response = await this.client.get<ApiResponse<any[]>>('/locals/nearby', {
      params: { city, country }
    })
    return response.data.data || []
  }

  async getCities(query?: string): Promise<{ city: string; country: string }[]> {
    const params = query ? { q: query } : {}
    const response = await this.client.get<ApiResponse<{ city: string; country: string }[]>>(
      '/locals/cities',
      { params }
    )
    return response.data.data || []
  }

  // Chat endpoints
  async createChat(localId: string, city: string): Promise<ChatWithDetails> {
    const response = await this.client.post<ApiResponse<ChatWithDetails>>('/chats', {
      local_id: localId,
      city
    })
    return response.data.data!
  }

  async getUserChats(): Promise<ChatWithDetails[]> {
    const response = await this.client.get<ApiResponse<ChatWithDetails[]>>('/chats')
    return response.data.data || []
  }

  async getChatMessages(chatId: string, page: number = 1, limit: number = 50): Promise<PaginatedResponse<Message>> {
    const response = await this.client.get<ApiResponse<Message[]>>(`/chats/${chatId}/messages`, {
      params: { page, limit }
    })
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
      }
    }
  }

  async sendMessage(chatId: string, content: string, messageType: string = 'text'): Promise<Message> {
    const response = await this.client.post<ApiResponse<Message>>(`/chats/${chatId}/messages`, {
      content,
      message_type: messageType
    })
    return response.data.data!
  }

  async markMessagesAsRead(chatId: string, messageIds: string[]): Promise<boolean> {
    const response = await this.client.put<ApiResponse<boolean>>(`/chats/${chatId}/read`, {
      message_ids: messageIds
    })
    return response.data.data || false
  }

  async archiveChat(chatId: string): Promise<boolean> {
    const response = await this.client.delete<ApiResponse<boolean>>(`/chats/${chatId}`)
    return response.data.data || false
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health')
    return response.data
  }
}

export const api = new ApiClient()
export default api