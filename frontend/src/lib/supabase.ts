import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tyiqdifguusvbhaigcxg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5aXFkaWZndXVzdmJoYWlnY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDIyMTQsImV4cCI6MjA2ODg3ODIxNH0.RdZ2AXTAEoDjnT6qsfS2O7X44f57rOWjhBLE1Q9MAq4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Demo user credentials for testing
const demoUsers = {
  admin: {
    password: 'admin123',
    role: 'admin',
    full_name: 'Administrator',
    email: 'admin@shivshiva.com',
    permissions: ['all']
  },
  manager: {
    password: 'manager123',
    role: 'manager',
    full_name: 'Manager',
    email: 'manager@shivshiva.com',
    permissions: ['tenants', 'payments', 'rooms']
  },
  security: {
    password: 'security123',
    role: 'security',
    full_name: 'Security Guard',
    email: 'security@shivshiva.com',
    permissions: ['visitors', 'maintenance']
  }
}

// Helper function to handle Supabase auth for our existing backend structure
export const supabaseAuth = {
  async login(username: string, password: string) {
    try {
      // Check if it's a demo user first
      const demoUser = demoUsers[username as keyof typeof demoUsers]
      
      if (demoUser && demoUser.password === password) {
        // Simulate successful login for demo users
        const mockToken = `demo_token_${username}_${Date.now()}`
        const mockUser = {
          id: `demo_${username}_id`,
          username: username,
          email: demoUser.email,
          role: demoUser.role,
          full_name: demoUser.full_name,
          phone: '+91 98765 43210',
          is_active: true,
          permissions: demoUser.permissions
        }

        // Store demo session
        localStorage.setItem('demoSession', JSON.stringify({
          token: mockToken,
          user: mockUser,
          expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }))

        return {
          token: mockToken,
          user: mockUser,
          expires_in: '24h'
        }
      }

      // If not a demo user, try Supabase authentication
      const email = username.includes('@') ? username : `${username}@shivshiva.com`
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // If Supabase auth fails, check if it's a demo user with wrong password
        if (demoUser) {
          throw new Error('Invalid password for demo user. Please use the correct demo password.')
        }
        throw error
      }

      // Return in our expected format for real users
      return {
        token: data.session?.access_token,
        user: {
          id: data.user?.id,
          username: username,
          email: data.user?.email,
          role: data.user?.user_metadata?.role || 'user',
          full_name: data.user?.user_metadata?.full_name || username,
          phone: data.user?.user_metadata?.phone,
          is_active: data.user?.email_confirmed_at ? true : false,
          permissions: data.user?.user_metadata?.permissions || []
        },
        expires_in: data.session?.expires_in
      }
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed. Please check your credentials.')
    }
  },

  async logout() {
    try {
      // Clear demo session
      localStorage.removeItem('demoSession')
      
      // Try Supabase logout if there's a real session
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('Supabase logout error:', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  async getSession() {
    try {
      // Check for demo session first
      const demoSession = localStorage.getItem('demoSession')
      if (demoSession) {
        const session = JSON.parse(demoSession)
        if (session.expires_at > Date.now()) {
          return {
            access_token: session.token,
            user: session.user
          }
        } else {
          // Demo session expired
          localStorage.removeItem('demoSession')
        }
      }

      // Check for real Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  },

  async getCurrentUser() {
    try {
      // Check for demo session first
      const demoSession = localStorage.getItem('demoSession')
      if (demoSession) {
        const session = JSON.parse(demoSession)
        if (session.expires_at > Date.now()) {
          return session.user
        } else {
          localStorage.removeItem('demoSession')
        }
      }

      // Check for real Supabase user
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  async isAuthenticated() {
    try {
      const session = await this.getSession()
      return !!session
    } catch (error) {
      return false
    }
  }
}