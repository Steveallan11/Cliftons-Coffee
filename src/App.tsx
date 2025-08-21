import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Header from '@/components/Header'
import HomePage from '@/pages/HomePage'
import AdminLogin from '@/pages/AdminLogin'
import AdminDashboard from '@/pages/AdminDashboard'
import OrderCheckout from '@/pages/OrderCheckout'
import AuthCallback from '@/pages/AuthCallback'
import EventsPage from '@/pages/EventsPage'
import BlogPage from '@/pages/BlogPage'
import EventDetailPage from '@/pages/EventDetailPage'
import BlogDetailPage from '@/pages/BlogDetailPage'
import { initializeDatabase, checkDatabaseStatus } from '@/utils/initializeDatabase'
import './App.css'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [initializationStatus, setInitializationStatus] = useState('')

  useEffect(() => {
    const initDatabase = async () => {
      try {
        setInitializationStatus('Checking database status...')
        
        // Check current database status
        const status = await checkDatabaseStatus()
        console.log('Database status:', status)
        
        if (!status.tablesExist || !status.menuPopulated || !status.adminExists) {
          setInitializationStatus('Initializing database...')
          console.log('Database needs initialization')
          
          const result = await initializeDatabase()
          if (result.success) {
            console.log('Database initialized successfully')
            setInitializationStatus('Database ready')
          } else {
            console.error('Database initialization failed:', result.error)
            setInitializationStatus('Database initialization failed - continuing anyway')
          }
        } else {
          console.log('Database already initialized')
          setInitializationStatus('Database ready')
        }
        
      } catch (error) {
        console.error('Error during database initialization:', error)
        setInitializationStatus('Database check failed - continuing anyway')
      } finally {
        // Always allow the app to continue after 3 seconds
        setTimeout(() => {
          setIsInitializing(false)
        }, 2000)
      }
    }

    initDatabase()
  }, [])

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFD1A3]/20 to-[#9CAF88]/10 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Starting Clifton's Coffee Shop</h2>
          <p className="text-gray-600">{initializationStatus}</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Elements stripe={stripePromise}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFD1A3]/20 to-[#9CAF88]/10">
                <Header />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:slug" element={<EventDetailPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/checkout" element={<OrderCheckout />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                </Routes>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#2D3748'
                    }
                  }}
                />
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </Elements>
    </ErrorBoundary>
  )
}

export default App