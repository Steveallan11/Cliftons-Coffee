import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if Supabase is configured
        const url = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
        
        if (!url || !key) {
          console.warn('Supabase not configured, redirecting to login')
          navigate('/admin-login?error=' + encodeURIComponent('Backend not configured'))
          return
        }

        // Get the hash fragment from the URL
        const hashFragment = window.location.hash

        if (hashFragment && hashFragment.length > 0) {
          // Exchange the auth code for a session
          const { data, error } = await (supabase as any).auth.exchangeCodeForSession(hashFragment)

          if (error) {
            console.error('Error exchanging code for session:', error.message)
            navigate('/admin-login?error=' + encodeURIComponent(error.message))
            return
          }

          if (data.session) {
            // Successfully signed in, redirect to admin
            navigate('/admin')
            return
          }
        }

        // If we get here, something went wrong
        navigate('/admin-login?error=No session found')
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/admin-login?error=Authentication failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="font-poppins text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

export default AuthCallback