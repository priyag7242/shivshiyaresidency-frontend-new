import { createClient } from '@supabase/supabase-js'

// Replace these with your Supabase project details
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to handle Supabase auth for our existing backend structure
export const supabaseAuth = {
  async login(username: string, password: string) {
    // For compatibility, we'll use email as username@shivshiva.com
    const email = username.includes('@') ? username : `${username}@shivshiva.com`
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Return in our expected format
    return {
      token: data.session?.access_token,
      user: {
        id: data.user?.id,
        username: username,
        email: data.user?.email,
        role: data.user?.user_metadata?.role || 'user',
        full_name: data.user?.user_metadata?.full_name || username,
      }
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}