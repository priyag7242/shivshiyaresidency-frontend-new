// Frontend Supabase Integration

// 1. Install Supabase client
// npm install @supabase/supabase-js

// 2. Create supabase client (src/lib/supabase.ts)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 3. Authentication Hook (src/hooks/useAuth.ts)
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return { user, loading, signIn, signOut }
}

// 4. Example: Rooms CRUD Operations
export const roomsApi = {
  // Get all rooms
  async getAll() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number')
    
    if (error) throw error
    return data
  },

  // Get single room
  async getById(id: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create room
  async create(room: any) {
    const { data, error } = await supabase
      .from('rooms')
      .insert([room])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update room
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete room
  async delete(id: string) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 5. Example: Dashboard Stats
export const getDashboardStats = async () => {
  // Get counts in parallel
  const [rooms, tenants, pendingPayments, maintenanceIssues] = await Promise.all([
    supabase.from('rooms').select('*', { count: 'exact', head: true }),
    supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('maintenance').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  ])

  return {
    totalRooms: rooms.count || 0,
    occupiedRooms: tenants.count || 0,
    pendingPayments: pendingPayments.count || 0,
    maintenanceRequests: maintenanceIssues.count || 0
  }
}

// 6. Real-time subscriptions example
export const useRealtimeRooms = () => {
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    // Initial fetch
    roomsApi.getAll().then(setRooms)

    // Subscribe to changes
    const subscription = supabase
      .channel('rooms-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rooms' 
      }, (payload) => {
        console.log('Room change:', payload)
        // Refetch rooms on any change
        roomsApi.getAll().then(setRooms)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return rooms
}