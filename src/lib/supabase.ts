import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://oywowjszienmedmqkjhm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d293anN6aWVubWVkbXFramhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzMzMjcsImV4cCI6MjA3MTIwOTMyN30.M2YGe6b7td_NCUDzfPoJFbxyUxE9KMJEvds2SkpLkSI'

// Create mock query builder that matches Supabase interface
const createMockQueryBuilder = () => {
  const mockBuilder = {
    select: () => mockBuilder,
    insert: () => mockBuilder,
    update: () => mockBuilder,
    delete: () => mockBuilder,
    eq: () => mockBuilder,
    order: () => mockBuilder,
    limit: () => mockBuilder,
    then: (resolve: Function) => resolve({ data: [], error: { message: 'Supabase not configured' } }),
    catch: (reject: Function) => mockBuilder,
    finally: (fn: Function) => { fn(); return mockBuilder }
  }
  // Make it thenable so it works with await
  Object.defineProperty(mockBuilder, Symbol.toStringTag, { value: 'Promise' })
  return mockBuilder
}

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Create a more robust client initialization
export const createSupabaseClient = () => {
  // Check if credentials are missing or invalid
  const hasValidCredentials = supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_url' &&
    supabaseAnonKey !== 'your_supabase_anon_key' &&
    isValidUrl(supabaseUrl)

  if (!hasValidCredentials) {
    console.warn('Supabase credentials missing or invalid. Using mock client for development.')
    // Return a mock client for development
    return {
      from: () => createMockQueryBuilder(),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ data: null, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        exchangeCodeForSession: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      },
      functions: {
        invoke: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      }
    }
  }
  
  try {
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return createSupabaseClient() // Return mock client if creation fails
  }
}

export const supabase = createSupabaseClient()

// Types
export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  priceRange?: string
  image: string
  category: string
  available: boolean
}

export interface CartItem extends MenuItem {
  quantity: number
  special_requests?: string
}

export interface Order {
  id: number
  customer_email: string
  customer_name?: string
  customer_phone?: string
  order_type: 'collection' | 'delivery'
  total_amount: number
  status: string
  stripe_payment_intent_id?: string
  special_instructions?: string
  delivery_address?: string
  created_at: string
  updated_at: string
}

export interface TableBooking {
  id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  party_size: number
  booking_date: string
  booking_time: string
  status: string
  special_requests?: string
  created_at: string
  updated_at: string
}