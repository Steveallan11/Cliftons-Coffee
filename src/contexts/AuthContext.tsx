import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { 
  authenticateAdmin, 
  getCurrentAdmin, 
  saveAdminSession, 
  clearAdminSession, 
  isAdminUser,
  AdminUser 
} from '@/utils/adminAuth'

interface AuthContextType {
  user: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  isAdmin: boolean
  backendAvailable: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [backendAvailable, setBackendAvailable] = useState(false)

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      try {
        // Test if Supabase is properly configured
        const url = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://oywowjszienmedmqkjhm.supabase.co'
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d293anN6aWVubWVkbXFramhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzMzMjcsImV4cCI6MjA3MTIwOTMyN30.M2YGe6b7td_NCUDzfPoJFbxyUxE9KMJEvds2SkpLkSI'
        
        if (url && key && url !== 'your_supabase_url' && key !== 'your_supabase_anon_key' && url.includes('supabase.co')) {
          setBackendAvailable(true)
          
          // Check for existing admin session
          const currentAdmin = getCurrentAdmin()
          if (currentAdmin && isAdminUser(currentAdmin)) {
            setUser(currentAdmin)
            console.log('Loaded existing admin session:', currentAdmin.email)
          }
        } else {
          setBackendAvailable(false)
          console.log('Supabase not configured, using demo mode')
        }
      } catch (error) {
        console.log('Supabase not available, using demo mode')
        setBackendAvailable(false)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  // Remove the Supabase auth state change listener since we're using custom auth
  // useEffect(() => {
  //   if (backendAvailable) {
  //     const { data: { subscription } } = supabase.auth.onAuthStateChange(
  //       (_event, session) => {
  //         setUser(session?.user || null)
  //       }
  //     )

  //     return () => subscription.unsubscribe()
  //   }
  // }, [backendAvailable])

  async function signIn(email: string, password: string) {
    console.log('Admin sign in attempt:', email)
    
    if (!backendAvailable) {
      // Demo mode - simulate successful login for admin
      if (email === 'admin@cliftonscoffee.com' && password === 'admin123') {
        const mockAdmin: AdminUser = {
          id: 1,
          email: 'admin@cliftonscoffee.com',
          name: 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString()
        }
        setUser(mockAdmin)
        saveAdminSession(mockAdmin)
        return { data: { user: mockAdmin }, error: null }
      } else {
        return { data: null, error: { message: 'Invalid credentials' } }
      }
    }
    
    // Use custom admin authentication
    try {
      const authResult = await authenticateAdmin(email, password)
      
      if (authResult.success && authResult.user) {
        console.log('Admin authentication successful')
        setUser(authResult.user)
        saveAdminSession(authResult.user)
        return { data: { user: authResult.user }, error: null }
      } else {
        console.log('Admin authentication failed:', authResult.error)
        return { data: null, error: { message: authResult.error || 'Invalid credentials' } }
      }
    } catch (error: any) {
      console.error('Admin sign in error:', error)
      return { data: null, error: { message: 'Authentication failed' } }
    }
  }

  async function signUp(email: string, password: string) {
    if (!backendAvailable) {
      return { data: null, error: { message: 'Registration not available in demo mode' } }
    }
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
      }
    })
  }

  async function signOut() {
    console.log('Admin sign out - starting process')
    
    try {
      // Clear admin session
      clearAdminSession()
      console.log('Admin session cleared from localStorage')
      
      // Clear user state
      setUser(null)
      console.log('User state cleared in context')
      
      if (!backendAvailable) {
        console.log('Demo mode logout completed')
        return { error: null }
      }
      
      // No need to call Supabase auth signOut since we're using custom auth
      console.log('Admin logout completed successfully')
      return { error: null }
    } catch (error) {
      console.error('Error during logout:', error)
      // Still clear the session even if there's an error
      clearAdminSession()
      setUser(null)
      return { error: null }
    }
  }

  // Check if current user is admin
  const isAdmin = user ? isAdminUser(user) : false

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isAdmin, backendAvailable }}>
      {children}
    </AuthContext.Provider>
  )
}