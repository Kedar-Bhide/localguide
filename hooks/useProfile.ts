import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'
import { User } from '../types'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          await createProfile()
        } else {
          throw error
        }
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    try {
      const fullName = user.user_metadata?.full_name || user.email || ''
      const { data, error } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            full_name: fullName,
            email: user.email,
            is_traveler: true,
            is_local: false
          }
        ])
        .select()
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user])

  return { profile, loading, refetch: fetchProfile }
}