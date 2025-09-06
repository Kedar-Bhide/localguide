import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { LoginData, SignupData } from '@/types'

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  bio?: string
  city?: string
  country?: string
  is_local: boolean
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  
  // Actions
  login: (data: LoginData) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  initialize: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,
      initialized: false,

      login: async (data: LoginData) => {
        try {
          set({ loading: true })
          
          const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          })
          
          if (error) throw error
          
          if (authData.user) {
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single()
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Profile fetch error:', profileError)
            }
            
            set({
              user: authData.user,
              profile: profile || null,
              loading: false
            })
            
            toast.success(`Welcome back, ${profile?.full_name || data.email}!`)
          }
        } catch (error: any) {
          set({ loading: false })
          toast.error(error.message || 'Login failed')
          throw error
        }
      },

      signup: async (data: SignupData) => {
        try {
          set({ loading: true })
          
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.full_name,
                user_type: data.user_type
              }
            }
          })
          
          if (error) throw error
          
          if (authData.user) {
            // Create user profile
            const profileData: any = {
              id: authData.user.id,
              email: data.email,
              full_name: data.full_name,
              is_local: data.user_type === 'local'
            }

            // Add local-specific data if user is signing up as a local expert
            if (data.user_type === 'local') {
              profileData.city = data.city
              profileData.bio = data.bio
              profileData.tags = data.tags || []
              
              // Extract country from city if it contains a comma
              if (data.city?.includes(',')) {
                const [city, country] = data.city.split(',').map(s => s.trim())
                profileData.city = city
                profileData.country = country
              }
            }

            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .insert(profileData)
              .select()
              .single()
              
            if (profileError) {
              console.error('Profile creation error:', profileError)
              throw profileError
            }

            // If user is a local expert, also create a local_profiles entry
            if (data.user_type === 'local' && profile) {
              const { error: localProfileError } = await supabase
                .from('local_profiles')
                .insert({
                  id: authData.user.id,
                  user_id: authData.user.id,
                  city: profileData.city,
                  country: profileData.country || '',
                  bio: data.bio || '',
                  tags: data.tags || [],
                  is_verified: false,
                  rating: 0,
                  total_connections: 0
                })

              if (localProfileError) {
                console.error('Local profile creation error:', localProfileError)
                // Don't throw here - main profile was created successfully
              }
            }
            
            set({
              user: authData.user,
              profile: profile || null,
              loading: false
            })
            
            const welcomeMessage = data.user_type === 'local' 
              ? `Welcome to LocalGuide, ${data.full_name}! Ready to share ${profileData.city} with travelers?`
              : `Welcome to LocalGuide, ${data.full_name}! Ready to explore the world?`
            
            toast.success(welcomeMessage)
          }
        } catch (error: any) {
          set({ loading: false })
          toast.error(error.message || 'Signup failed')
          throw error
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          
          set({
            user: null,
            profile: null,
            loading: false
          })
          
          toast.success('Logged out successfully')
        } catch (error: any) {
          toast.error(error.message || 'Logout failed')
        }
      },

      updateProfile: async (data: Partial<UserProfile>) => {
        try {
          set({ loading: true })
          const { user } = get()
          
          if (!user) throw new Error('No user logged in')
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', user.id)
            .select()
            .single()
            
          if (error) throw error
          
          set({
            profile: profile,
            loading: false
          })
          
          toast.success('Profile updated successfully')
        } catch (error: any) {
          set({ loading: false })
          toast.error(error.message || 'Update failed')
          throw error
        }
      },

      initialize: async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (error && error.message !== 'Invalid JWT') {
            console.error('Auth initialization error:', error)
          }
          
          if (user) {
            // Get user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            set({
              user,
              profile: profile || null,
              initialized: true
            })
          } else {
            set({
              user: null,
              profile: null,
              initialized: true
            })
          }
        } catch (error) {
          console.error('Initialize error:', error)
          set({
            user: null,
            profile: null,
            initialized: true
          })
        }
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            set({
              user: session.user,
              profile: profile || null
            })
          } else if (event === 'SIGNED_OUT') {
            set({
              user: null,
              profile: null
            })
          }
        })
      },

      setLoading: (loading: boolean) => set({ loading })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist user/profile - let Supabase handle session persistence
        initialized: state.initialized
      })
    }
  )
)