import { supabase } from '@/lib/supabase'

export interface OrderDetails {
  order: any
  items: Array<{
    id: number
    item_name: string
    item_price: number
    quantity: number
    subtotal: number
    special_requests?: string
  }>
  summary: {
    subtotal: number
    total: number
    itemCount: number
    totalQuantity: number
  }
}

class OrderService {
  // Get detailed order information
  async getOrderDetails(orderId: number): Promise<{ success: boolean; data?: OrderDetails; error?: string }> {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        `order-details?id=${orderId}`,
        { method: 'GET' }
      )

      if (error) {
        console.error('Order details error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: result.data }
    } catch (error: any) {
      console.error('Order details fetch error:', error)
      return { success: false, error: 'Failed to fetch order details' }
    }
  }

  // Update order status with activity logging
  async updateOrderStatus(orderId: number, status: string, adminEmail: string, notes?: string) {
    try {
      // Import database service for update
      const { updateOrderStatus } = await import('@/utils/databaseService')
      const result = await updateOrderStatus(orderId, status)

      if (result.success) {
        // Log the activity
        const { analyticsService } = await import('@/utils/analyticsService')
        await analyticsService.logActivity({
          admin_email: adminEmail,
          action_type: 'order_status_updated',
          action_description: `Updated order #${orderId} status to ${status}${notes ? ` with notes: ${notes}` : ''}`,
          target_type: 'order',
          target_id: orderId
        })
      }

      return result
    } catch (error: any) {
      console.error('Order status update error:', error)
      return { success: false, error: 'Failed to update order status' }
    }
  }

  // Update booking status with activity logging
  async updateBookingStatus(bookingId: number, status: string, adminEmail: string, notes?: string) {
    try {
      // Import database service for update
      const { updateBookingStatus } = await import('@/utils/databaseService')
      const result = await updateBookingStatus(bookingId, status)

      if (result.success) {
        // Log the activity
        const { analyticsService } = await import('@/utils/analyticsService')
        await analyticsService.logActivity({
          admin_email: adminEmail,
          action_type: 'booking_status_updated',
          action_description: `Updated booking #${bookingId} status to ${status}${notes ? ` with notes: ${notes}` : ''}`,
          target_type: 'booking',
          target_id: bookingId
        })
      }

      return result
    } catch (error: any) {
      console.error('Booking status update error:', error)
      return { success: false, error: 'Failed to update booking status' }
    }
  }
}

export const orderService = new OrderService()