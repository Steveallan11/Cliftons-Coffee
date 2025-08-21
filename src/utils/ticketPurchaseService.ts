import { supabase } from '@/lib/supabase'

// Ticket Purchase Service
export interface TicketPurchaseData {
  eventId: number
  quantity: number
  customerName: string
  customerEmail: string
  customerPhone?: string
}

export interface TicketPurchaseResult {
  clientSecret: string
  paymentIntentId: string
  totalAmount: number
  eventTitle: string
  eventDate: string
  quantity: number
}

export interface TicketConfirmationResult {
  success: boolean
  ticketSaleId: number
  confirmationNumber: string
  eventTitle: string
  eventDate: string
  quantity: number
  totalAmount: number
  customerName: string
  customerEmail: string
}

export interface TicketSale {
  id: number
  event_id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  quantity: number
  total_amount: number
  stripe_payment_intent_id: string
  status: string
  purchase_date: string
  created_at: string
}

class TicketPurchaseService {
  async createPaymentIntent(purchaseData: TicketPurchaseData): Promise<{ success: boolean; data?: TicketPurchaseResult; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('purchase-event-tickets', {
        body: {
          action: 'create_payment_intent',
          ...purchaseData
        }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error creating payment intent for tickets:', error)
      return { success: false, error: error.message }
    }
  }

  async confirmTicketPurchase(paymentIntentId: string): Promise<{ success: boolean; data?: TicketConfirmationResult; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('purchase-event-tickets', {
        body: {
          action: 'confirm_ticket_purchase',
          paymentIntentId
        }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error confirming ticket purchase:', error)
      return { success: false, error: error.message }
    }
  }

  async getTicketSales(): Promise<{ success: boolean; data?: TicketSale[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('purchase-event-tickets', {
        body: {
          action: 'get_ticket_sales'
        }
      })

      if (error) throw error
      return { success: true, data: data.data }
    } catch (error: any) {
      console.error('Error getting ticket sales:', error)
      return { success: false, error: error.message }
    }
  }
}

export const ticketPurchaseService = new TicketPurchaseService()
