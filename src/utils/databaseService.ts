// Database service functions for orders and bookings
import { supabase } from '@/lib/supabase'
import { CartItem } from '@/lib/supabase'

// Check if Supabase is properly configured
const isSupabaseAvailable = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key && url.includes('supabase.co') && key.startsWith('eyJ'))
}

export interface OrderData {
  customer_email: string
  customer_name: string
  customer_phone?: string
  order_type: 'collection' | 'delivery'
  total_amount: number
  special_instructions?: string
  delivery_address?: string
  items: CartItem[]
}

export interface BookingData {
  customer_name: string
  customer_email: string
  customer_phone?: string
  party_size: number
  booking_date: string
  booking_time: string
  special_requests?: string
}

// Create order in database
export const createOrder = async (orderData: OrderData): Promise<{ success: boolean; orderId?: number; error?: string }> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase not available, returning mock order')
    return { 
      success: true, 
      orderId: Math.floor(Math.random() * 10000) + 1000 
    }
  }

  try {
    // Create the order record
    const { data: orderRecord, error: orderError } = await (supabase as any)
      .from('orders')
      .insert({
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        order_type: orderData.order_type,
        total_amount: orderData.total_amount,
        status: 'pending',
        special_instructions: orderData.special_instructions,
        delivery_address: orderData.delivery_address
      })
      .select()
      .maybeSingle()

    if (orderError) {
      console.error('Failed to create order:', orderError)
      return { success: false, error: orderError.message }
    }

    const orderId = orderRecord?.id
    if (!orderId) {
      return { success: false, error: 'No order ID returned' }
    }

    // Create order items
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
        special_requests: item.special_requests || null
      }))

      const { error: itemsError } = await (supabase as any)
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Failed to create order items:', itemsError)
        // Don't fail the whole order for this
      }
    }

    console.log('Order created successfully:', orderId)
    return { success: true, orderId }
    
  } catch (error: any) {
    console.error('Order creation error:', error)
    return { success: false, error: error.message }
  }
}

// Create table booking
export const createBooking = async (bookingData: BookingData): Promise<{ success: boolean; bookingId?: number; error?: string }> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase not available, returning mock booking')
    return { 
      success: true, 
      bookingId: Math.floor(Math.random() * 10000) + 2000 
    }
  }

  try {
    const { data: bookingRecord, error: bookingError } = await (supabase as any)
      .from('table_bookings')
      .insert({
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_phone: bookingData.customer_phone,
        party_size: bookingData.party_size,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        status: 'pending',
        special_requests: bookingData.special_requests
      })
      .select()
      .maybeSingle()

    if (bookingError) {
      console.error('Failed to create booking:', bookingError)
      return { success: false, error: bookingError.message }
    }

    const bookingId = bookingRecord?.id
    console.log('Booking created successfully:', bookingId)
    return { success: true, bookingId }
    
  } catch (error: any) {
    console.error('Booking creation error:', error)
    return { success: false, error: error.message }
  }
}

// Update order status
export const updateOrderStatus = async (orderId: number, status: string): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase not available, mock status update')
    return { success: true }
  }

  try {
    const { error } = await (supabase as any)
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      console.error('Failed to update order status:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Order status update error:', error)
    return { success: false, error: error.message }
  }
}

// Update booking status
export const updateBookingStatus = async (bookingId: number, status: string): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase not available, mock status update')
    return { success: true }
  }

  try {
    const { error } = await (supabase as any)
      .from('table_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      console.error('Failed to update booking status:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Booking status update error:', error)
    return { success: false, error: error.message }
  }
}