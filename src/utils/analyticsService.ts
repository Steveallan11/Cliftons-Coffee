import { supabase } from '@/lib/supabase'

export interface AnalyticsData {
  totalOrders: number
  totalBookings: number
  totalMessages: number
  unreadMessages: number
  totalRevenue: number
  avgOrderValue: number
  ordersByStatus: Record<string, number>
  bookingsByStatus: Record<string, number>
  dailyRevenue: Array<{ date: string; revenue: number }>
  period: string
}

export interface PopularItem {
  name: string
  totalQuantity: number
  totalRevenue: number
  orderCount: number
}

class AnalyticsService {
  // Get overview analytics
  async getOverviewAnalytics(period: string = '7d'): Promise<{ success: boolean; data?: AnalyticsData; error?: string }> {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        `admin-analytics?type=overview&period=${period}`,
        { method: 'GET' }
      )

      if (error) {
        console.error('Analytics error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: result.data }
    } catch (error: any) {
      console.error('Analytics fetch error:', error)
      return { success: false, error: 'Failed to fetch analytics' }
    }
  }

  // Get popular items analytics
  async getPopularItems(period: string = '7d'): Promise<{ success: boolean; data?: PopularItem[]; error?: string }> {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        `admin-analytics?type=popular-items&period=${period}`,
        { method: 'GET' }
      )

      if (error) {
        console.error('Popular items error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: result.data }
    } catch (error: any) {
      console.error('Popular items fetch error:', error)
      return { success: false, error: 'Failed to fetch popular items' }
    }
  }

  // Log admin activity
  async logActivity(data: {
    admin_email: string
    action_type: string
    action_description?: string
    target_type?: string
    target_id?: number
  }) {
    try {
      const { data: result, error } = await supabase.functions.invoke('log-activity', {
        body: data
      })

      if (error) {
        console.error('Activity log error:', error)
        return { success: false, error: error.message }
      }

      return result
    } catch (error: any) {
      console.error('Activity logging error:', error)
      return { success: false, error: 'Failed to log activity' }
    }
  }
}

export const analyticsService = new AnalyticsService()