// Stripe payment service
import { CartItem } from '@/lib/supabase'

const STRIPE_SECRET_KEY = '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'

export interface PaymentIntentData {
  amount: number
  currency?: string
  cartItems: CartItem[]
  customerEmail: string
  customerName: string
  customerPhone?: string
  orderType: 'collection' | 'delivery'
  deliveryAddress?: string
  specialInstructions?: string
}

// Create payment intent directly with Stripe API
export const createPaymentIntent = async (data: PaymentIntentData): Promise<{ success: boolean; clientSecret?: string; paymentIntentId?: string; error?: string }> => {
  try {
    console.log('Creating payment intent:', { amount: data.amount, customer: data.customerEmail })

    // Validate required parameters
    if (!data.amount || data.amount <= 0) {
      throw new Error('Valid amount is required')
    }

    if (!data.cartItems || !Array.isArray(data.cartItems) || data.cartItems.length === 0) {
      throw new Error('Cart items are required')
    }

    if (!data.customerEmail || !data.customerName) {
      throw new Error('Customer email and name are required')
    }

    // Calculate total amount from cart items to verify
    const deliveryFee = data.orderType === 'delivery' ? 2.50 : 0
    const calculatedAmount = data.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + deliveryFee
    
    if (Math.abs(calculatedAmount - data.amount) > 0.01) {
      throw new Error('Amount mismatch: calculated amount does not match provided amount')
    }

    // Prepare Stripe payment intent data
    const stripeParams = new URLSearchParams()
    stripeParams.append('amount', Math.round(data.amount * 100).toString()) // Convert to cents
    stripeParams.append('currency', data.currency || 'gbp')
    stripeParams.append('payment_method_types[]', 'card')
    stripeParams.append('metadata[customer_email]', data.customerEmail)
    stripeParams.append('metadata[customer_name]', data.customerName)
    stripeParams.append('metadata[customer_phone]', data.customerPhone || '')
    stripeParams.append('metadata[order_type]', data.orderType)
    stripeParams.append('metadata[cart_items_count]', data.cartItems.length.toString())
    stripeParams.append('metadata[total_items]', data.cartItems.reduce((sum, item) => sum + item.quantity, 0).toString())
    stripeParams.append('metadata[delivery_address]', data.deliveryAddress || '')
    stripeParams.append('metadata[special_instructions]', data.specialInstructions || '')

    // Create payment intent with Stripe
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: stripeParams.toString()
    })

    console.log('Stripe API response status:', stripeResponse.status)

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text()
      console.error('Stripe API error:', errorData)
      throw new Error(`Payment processing failed: ${errorData}`)
    }

    const paymentIntent = await stripeResponse.json()
    console.log('Payment intent created successfully:', paymentIntent.id)

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }

  } catch (error: any) {
    console.error('Payment intent creation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Retrieve payment intent status
export const getPaymentIntentStatus = async (paymentIntentId: string): Promise<{ success: boolean; status?: string; error?: string }> => {
  try {
    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to retrieve payment intent: ${errorData}`)
    }

    const paymentIntent = await response.json()
    
    return {
      success: true,
      status: paymentIntent.status
    }

  } catch (error: any) {
    console.error('Error retrieving payment intent:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
