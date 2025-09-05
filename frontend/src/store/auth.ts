import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { User, UserProfile, LoginData, SignupData } from '@/types'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  token: string | null
  loading: boolean
  initialized: boolean
  
  // Actions
  login: (data: LoginData) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  initialize: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      token: null,
      loading: false,
      initialized: false,

      login: async (data: LoginData) => {
        try {
          set({ loading: true })
          const response = await api.login(data)
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token)
          
          set({
            user: response.user,
            profile: response.profile,
            token: response.token,
            loading: false
          })
          
          toast.success(`Welcome back, ${response.user.full_name}!`)
        } catch (error: any) {
          set({ loading: false })
          throw error
        }
      },

      signup: async (data: SignupData) => {
        try {
          set({ loading: true })
          const response = await api.signup(data)
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token)
          
          set({
            user: response.user,
            profile: response.profile,
            token: response.token,
            loading: false
          })
          
          toast.success(`Welcome to LocalGuide, ${response.user.full_name}!`)
        } catch (error: any) {
          set({ loading: false })
          throw error
        }
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('user_profile')
        
        set({
          user: null,
          profile: null,
          token: null,
          loading: false
        })
        
        toast.success('Logged out successfully')
      },

      updateProfile: async (data: Partial<UserProfile>) => {
        try {
          set({ loading: true })
          const updatedProfile = await api.updateProfile(data)
          
          set({
            profile: updatedProfile,
            loading: false
          })
          
          toast.success('Profile updated successfully')
        } catch (error: any) {
          set({ loading: false })
          throw error
        }
      },

      initialize: async () => {
        const token = localStorage.getItem('auth_token')
        
        if (!token) {
          set({ initialized: true })
          return
        }

        try {
          set({ loading: true })
          const response = await api.getCurrentUser()
          
          set({
            user: response.user,
            profile: response.profile,
            token,
            loading: false,
            initialized: true
          })
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token')
          set({
            user: null,
            profile: null,
            token: null,
            loading: false,
            initialized: true
          })
        }
      },

      setLoading: (loading: boolean) => set({ loading })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        token: state.token
      })
    }
  )
)