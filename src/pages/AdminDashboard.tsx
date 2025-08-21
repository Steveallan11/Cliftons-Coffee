import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Coffee, 
  ShoppingBag, 
  Calendar, 
  Users, 
  BarChart3, 
  LogOut,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  MessageCircle,
  Eye,
  Bell,
  Moon,
  Sun,
  Settings,
  Activity,
  Check,
  FileText
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { analyticsService } from '@/utils/analyticsService'
import { orderService } from '@/utils/orderService'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import MessagesManagement from '@/components/MessagesManagement'
import OrderDetailsModal from '@/components/OrderDetailsModal'
import BookingCalendar from '@/components/BookingCalendar'
import MenuManagement from '@/components/MenuManagement'
import EventsManagement from '@/components/EventsManagement'
import BlogManagement from '@/components/BlogManagement'
import TicketSalesManagement from '@/components/TicketSalesManagement'
import toast from 'react-hot-toast'

type TabType = 'overview' | 'analytics' | 'menu' | 'orders' | 'bookings' | 'calendar' | 'messages' | 'events' | 'blog' | 'tickets' | 'customers'

interface Order {
  id: number
  customer_name: string
  customer_email: string
  order_type: string
  total_amount: number
  status: string
  created_at: string
}

interface Booking {
  id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  party_size: number
  booking_date: string
  booking_time: string
  status: string
  created_at: string
}

interface DashboardStats {
  totalOrders: number
  totalBookings: number
  totalMessages: number
  unreadMessages: number
  totalRevenue: number
  avgOrderValue: number
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d')
  const [darkMode, setDarkMode] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { user, isAdmin, signOut, backendAvailable } = useAuth()
  const navigate = useNavigate()

  // Mock data for demo mode
  const mockOrders: Order[] = [
    {
      id: 1001,
      customer_name: 'John Smith',
      customer_email: 'john@example.com',
      order_type: 'collection',
      total_amount: 12.50,
      status: 'pending',
      created_at: new Date().toISOString()
    },
    {
      id: 1002,
      customer_name: 'Sarah Jones',
      customer_email: 'sarah@example.com',
      order_type: 'delivery',
      total_amount: 18.95,
      status: 'confirmed',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 1003,
      customer_name: 'Mike Wilson',
      customer_email: 'mike@example.com',
      order_type: 'collection',
      total_amount: 8.99,
      status: 'completed',
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ]

  const mockBookings: Booking[] = [
    {
      id: 2001,
      customer_name: 'Emma Brown',
      customer_email: 'emma@example.com',
      customer_phone: '+44 123 456 789',
      party_size: 4,
      booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      booking_time: '12:00',
      status: 'pending',
      created_at: new Date().toISOString()
    },
    {
      id: 2002,
      customer_name: 'David Lee',
      customer_email: 'david@example.com',
      customer_phone: '+44 987 654 321',
      party_size: 2,
      booking_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      booking_time: '14:30',
      status: 'confirmed',
      created_at: new Date(Date.now() - 43200000).toISOString()
    }
  ]

  useEffect(() => {
    if (!user) {
      navigate('/admin-login')
      return
    }
    
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.')
      navigate('/')
      return
    }

    loadData()
  }, [user, isAdmin, navigate, backendAvailable])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (!backendAvailable) {
        // Use mock data in demo mode
        setTimeout(() => {
          setOrders(mockOrders)
          setBookings(mockBookings)
          setDashboardStats({
            totalOrders: 3,
            totalBookings: 2,
            totalMessages: 0,
            unreadMessages: 0,
            totalRevenue: 40.44,
            avgOrderValue: 13.48
          })
          setLoading(false)
        }, 1000)
        return
      }
      
      // Load real data from Supabase
      const [ordersResult, bookingsResult, analyticsResult] = await Promise.all([
        // Load orders
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        
        // Load bookings
        supabase
          .from('table_bookings')
          .select('*')
          .order('booking_date', { ascending: true })
          .limit(50),
          
        // Load analytics
        analyticsService.getOverviewAnalytics('7d')
      ])

      if (ordersResult.data) {
        setOrders(ordersResult.data)
      }

      if (bookingsResult.data) {
        setBookings(bookingsResult.data)
      }

      if (analyticsResult.success && analyticsResult.data) {
        setDashboardStats({
          totalOrders: analyticsResult.data.totalOrders,
          totalBookings: analyticsResult.data.totalBookings,
          totalMessages: analyticsResult.data.totalMessages,
          unreadMessages: analyticsResult.data.unreadMessages,
          totalRevenue: analyticsResult.data.totalRevenue,
          avgOrderValue: analyticsResult.data.avgOrderValue
        })
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Fallback to mock data
      setOrders(mockOrders)
      setBookings(mockBookings)
      setDashboardStats({
        totalOrders: 3,
        totalBookings: 2,
        totalMessages: 0,
        unreadMessages: 0,
        totalRevenue: 40.44,
        avgOrderValue: 13.48
      })
      if (backendAvailable) {
        toast.error('Using demo data - database connection issues')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      console.log('Starting admin logout process')
      await signOut()
      console.log('Logout completed, redirecting...')
      
      // Force a complete page refresh to ensure clean logout
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if there's an error
      window.location.href = '/'
    }
  }

  const handleOrderClick = (orderId: number) => {
    setSelectedOrderId(orderId)
    setShowOrderModal(true)
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      if (!backendAvailable) {
        // Demo mode - just update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ))
        toast.success('Order status updated successfully (Demo Mode)')
        return
      }

      const result = await orderService.updateOrderStatus(orderId, status, user?.email || 'admin')

      if (result.success) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ))
        toast.success('Order status updated successfully')
        loadData() // Refresh stats
      } else {
        toast.error(result.error || 'Failed to update order status')
      }
    } catch (error: any) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    }
  }

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      if (!backendAvailable) {
        // Demo mode - just update local state
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        ))
        toast.success('Booking status updated successfully (Demo Mode)')
        return
      }

      const result = await orderService.updateBookingStatus(bookingId, status, user?.email || 'admin')

      if (result.success) {
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        ))
        toast.success('Booking status updated successfully')
        loadData() // Refresh stats
      } else {
        toast.error(result.error || 'Failed to update booking status')
      }
    } catch (error: any) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking status')
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'bookings', name: 'Table Bookings', icon: Calendar },
    { id: 'calendar', name: 'Booking Calendar', icon: Activity },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'menu', name: 'Menu Management', icon: Coffee },
    { id: 'events', name: 'Events Management', icon: Calendar },
    { id: 'tickets', name: 'Ticket Sales', icon: AlertTriangle },
    { id: 'blog', name: 'Blog Management', icon: FileText },
    { id: 'customers', name: 'Customers', icon: Users }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#9CAF88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-poppins text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      {/* Enhanced Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#9CAF88] rounded-full flex items-center justify-center">
                <Coffee className="text-white" size={20} />
              </div>
              <div>
                <h1 className={`font-fredericka text-2xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Clifton's Admin
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Coffee Shop Management
                </p>
              </div>
              {!backendAvailable && (
                <div className="flex items-center space-x-2 ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  <AlertTriangle size={14} />
                  <span className="text-xs font-medium">Demo Mode</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {dashboardStats?.unreadMessages && dashboardStats.unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {dashboardStats.unreadMessages}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <span className={`font-poppins text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Welcome, Admin
              </span>
              
              <button 
                onClick={handleSignOut}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <LogOut size={16} />
                <span className="font-poppins text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!backendAvailable && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="text-blue-600" size={20} />
              <div>
                <h3 className="font-poppins font-semibold text-blue-800">Demo Mode Active</h3>
                <p className="font-poppins text-sm text-blue-700">
                  The backend is not configured. Showing demo data and functionality.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Tab Navigation */}
        <div className="mb-8">
          <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-[#9CAF88] text-[#9CAF88]'
                        : darkMode
                        ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-poppins">{tab.name}</span>
                    {tab.id === 'messages' && dashboardStats?.unreadMessages && dashboardStats.unreadMessages > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {dashboardStats.unreadMessages}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Enhanced Stats Grid */}
              {dashboardStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl p-6 border shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-poppins ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Revenue</p>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {formatCurrency(dashboardStats.totalRevenue)}
                        </p>
                        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"} mt-1`}>
                          Avg: {formatCurrency(dashboardStats.avgOrderValue)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-green-600" size={24} />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl p-6 border shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-poppins ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Orders</p>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {dashboardStats.totalOrders}
                        </p>
                        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"} mt-1`}>
                          Active: {orders.filter(o => ["pending", "confirmed"].includes(o.status)).length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="text-blue-600" size={24} />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl p-6 border shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-poppins ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Table Bookings</p>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {dashboardStats.totalBookings}
                        </p>
                        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"} mt-1`}>
                          Pending: {bookings.filter(b => b.status === "pending").length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="text-purple-600" size={24} />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl p-6 border shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-poppins ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Messages</p>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {dashboardStats.totalMessages}
                        </p>
                        <p className={`text-xs ${dashboardStats.unreadMessages > 0 ? "text-red-500 font-medium" : (darkMode ? "text-gray-500" : "text-gray-500")} mt-1`}>
                          {dashboardStats.unreadMessages > 0 ? `${dashboardStats.unreadMessages} unread` : "All read"}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <MessageCircle className="text-yellow-600" size={24} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <AnalyticsDashboard 
              period={analyticsPeriod} 
              onPeriodChange={setAnalyticsPeriod}
            />
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <MessagesManagement />
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Order Management</h2>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {orders.length} orders total
                  </span>
                </div>
              </div>
              
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-sm border overflow-hidden`}>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                    <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No orders found</p>
                    <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"} mt-2`}>Orders will appear here once customers place them</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                        <tr>
                          <th className={`text-left p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Order ID</th>
                          <th className={`text-left p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Customer</th>
                          <th className={`text-left p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Type</th>
                          <th className={`text-center p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Amount</th>
                          <th className={`text-center p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Status</th>
                          <th className={`text-center p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date</th>
                          <th className={`text-center p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleOrderClick(order.id)}
                            className={`border-t cursor-pointer transition-colors hover:bg-opacity-50 ${
                              darkMode 
                                ? "border-gray-700 hover:bg-gray-700" 
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <td className="p-4">
                              <div className="font-medium text-blue-600 dark:text-blue-400">#{order.id}</div>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>{order.customer_name}</div>
                                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{order.customer_email}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                order.order_type === 'delivery' 
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                  : 'bg-green-100 text-green-800 border border-green-200'
                              }`}>
                                {order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1)}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                {formatCurrency(order.total_amount)}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {formatDate(order.created_at)}
                              </div>
                              <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"} mt-1`}>
                                {formatTime(order.created_at)}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOrderClick(order.id)
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    darkMode
                                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                  }`}
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {order.status === 'pending' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateOrderStatus(order.id, 'confirmed')
                                    }}
                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Confirm Order"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                {order.status === 'confirmed' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateOrderStatus(order.id, 'completed')
                                    }}
                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Mark Complete"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Table Bookings</h2>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {bookings.length} bookings total
                  </span>
                </div>
              </div>
              
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-sm border overflow-hidden`}>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                    <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No bookings found</p>
                    <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"} mt-2`}>Table bookings will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                        <tr>
                          <th className={`text-left p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Booking ID</th>
                          <th className={`text-left p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Customer</th>
                          <th className={`text-center p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Party Size</th>
                          <th className={`text-center p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date & Time</th>
                          <th className={`text-center p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Status</th>
                          <th className={`text-center p-4 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking, index) => (
                          <motion.tr
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`border-t transition-colors hover:bg-opacity-50 ${
                              darkMode 
                                ? "border-gray-700 hover:bg-gray-700" 
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <td className="p-4">
                              <div className="font-medium text-purple-600 dark:text-purple-400">#{booking.id}</div>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>{booking.customer_name}</div>
                                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{booking.customer_email}</div>
                                {booking.customer_phone && (
                                  <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"} mt-1`}>{booking.customer_phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                {booking.party_size} guests
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                                {formatDate(booking.booking_date)}
                              </div>
                              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>
                                {booking.booking_time}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                {booking.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                {booking.status === 'pending' && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Confirm Booking"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                {booking.status === 'confirmed' && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'completed')}
                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Mark Complete"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === "calendar" && (
            <BookingCalendar darkMode={darkMode} />
          )}

          {/* Menu Tab */}
          {activeTab === "menu" && (
            <MenuManagement darkMode={darkMode} />
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <EventsManagement darkMode={darkMode} />
          )}

          {/* Blog Tab */}
          {activeTab === "blog" && (
            <BlogManagement darkMode={darkMode} />
          )}
          
          {/* Tickets Tab */}
          {activeTab === "tickets" && (
            <TicketSalesManagement darkMode={darkMode} />
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Customer Management</h2>
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-sm border p-6`}>
                <div className="text-center py-12">
                  <Users className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Customer management coming soon</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false)
          setSelectedOrderId(null)
        }}
        orderId={selectedOrderId}
        onStatusUpdate={loadData}
      />
    </div>
  )
}

export default AdminDashboard
