import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  MessageCircle,
  Users,
  Clock,
  Star
} from 'lucide-react'
import { analyticsService, AnalyticsData, PopularItem } from '@/utils/analyticsService'
import toast from 'react-hot-toast'

interface AnalyticsDashboardProps {
  period: string
  onPeriodChange: (period: string) => void
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ period, onPeriodChange }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [analyticsResult, itemsResult] = await Promise.all([
        analyticsService.getOverviewAnalytics(period),
        analyticsService.getPopularItems(period)
      ])

      if (analyticsResult.success && analyticsResult.data) {
        setAnalyticsData(analyticsResult.data)
      }

      if (itemsResult.success && itemsResult.data) {
        setPopularItems(itemsResult.data)
      }
    } catch (error) {
      console.error('Analytics loading error:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const periodOptions = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ]

  const formatCurrency = (value: number) => `£${value.toFixed(2)}`

  const pieColors = ['#9CAF88', '#8A9F78', '#7A8F68', '#6A7F58', '#5A6F48']

  const statusChartData = analyticsData ? Object.entries(analyticsData.ordersByStatus).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
    percentage: Math.round((count / analyticsData.totalOrders) * 100)
  })) : []

  const bookingChartData = analyticsData ? Object.entries(analyticsData.bookingsByStatus).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
    percentage: Math.round((count / analyticsData.totalBookings) * 100)
  })) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#9CAF88] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h2>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88]/20 focus:border-[#9CAF88]"
        >
          {periodOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {analyticsData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Avg: {formatCurrency(analyticsData.avgOrderValue)}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Active: {analyticsData.ordersByStatus.confirmed || 0}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Table Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Confirmed: {analyticsData.bookingsByStatus.confirmed || 0}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalMessages}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                {analyticsData.unreadMessages > 0 ? (
                  <span className="text-sm text-red-600 font-medium">
                    {analyticsData.unreadMessages} unread
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">All read</span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Daily Revenue</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tickFormatter={(value) => `£${value}`} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-GB')}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#9CAF88" 
                    strokeWidth={3}
                    dot={{ fill: '#9CAF88', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Order Status Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Order Status Distribution</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name) => [value, 'Orders']} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Popular Items */}
          {popularItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Popular Items</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularItems.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'totalQuantity') return [value, 'Quantity Sold']
                      if (name === 'totalRevenue') return [formatCurrency(value), 'Revenue']
                      return [value, name]
                    }}
                  />
                  <Bar dataKey="totalQuantity" fill="#9CAF88" name="totalQuantity" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Booking Status Distribution */}
          {analyticsData.totalBookings > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Booking Status Distribution</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                  >
                    {bookingChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name) => [value, 'Bookings']} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default AnalyticsDashboard