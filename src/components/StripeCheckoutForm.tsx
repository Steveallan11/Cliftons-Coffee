import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { createPaymentIntent } from '@/utils/stripeService'
import { createOrder } from '@/utils/databaseService'
import toast from 'react-hot-toast'
import { Loader2, CreditCard } from 'lucide-react'

interface StripeCheckoutFormProps {
  amount: number
  cartItems: any[]
  customerDetails: {
    name: string
    email: string
    phone: string
  }
  orderType: 'collection' | 'delivery'
  deliveryAddress?: string
  specialInstructions?: string
  onSuccess: (orderId: number) => void
  onError: (error: string) => void
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  amount,
  cartItems,
  customerDetails,
  orderType,
  deliveryAddress,
  specialInstructions,
  onSuccess,
  onError
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError('Card element not found. Please refresh and try again.')
      return
    }

    setIsProcessing(true)

    try {
      // Step 1: Create payment intent
      const paymentResult = await createPaymentIntent({
        amount: amount + (orderType === 'delivery' ? 2.50 : 0),
        currency: 'gbp',
        cartItems: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          quantity: item.quantity,
          special_requests: item.special_requests,
          category: item.category || '',
          image: item.image || '',
          available: true
        })),
        customerEmail: customerDetails.email,
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        orderType: orderType,
        deliveryAddress: deliveryAddress || undefined,
        specialInstructions: specialInstructions || undefined
      })

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to create payment intent')
      }

      const { clientSecret, paymentIntentId } = paymentResult

      if (!clientSecret) {
        throw new Error('No client secret received from payment service')
      }

      // Step 2: Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerDetails.name,
            email: customerDetails.email,
            phone: customerDetails.phone
          }
        }
      })

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed')
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Step 3: Create order in database
        const orderResult = await createOrder({
          customer_email: customerDetails.email,
          customer_name: customerDetails.name,
          customer_phone: customerDetails.phone,
          order_type: orderType,
          total_amount: amount + (orderType === 'delivery' ? 2.50 : 0),
          special_instructions: specialInstructions,
          delivery_address: deliveryAddress,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            quantity: item.quantity,
            special_requests: item.special_requests,
            category: item.category || '',
            image: item.image || '',
            available: true
          }))
        })

        if (!orderResult.success) {
          console.error('Order creation failed:', orderResult.error)
          // Payment succeeded but order creation failed - this needs attention
          toast.error('Payment successful but order recording failed. Please contact support.')
          return
        }

        const orderId = orderResult.orderId
        if (orderId) {
          onSuccess(orderId)
          toast.success('Payment successful! Your order has been confirmed.')
        } else {
          throw new Error('Order created but no ID returned')
        }
      } else {
        throw new Error('Payment was not completed successfully')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      onError(error.message || 'An unexpected error occurred')
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'Poppins, system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-poppins font-medium text-gray-700 mb-3">
          Card Details
        </label>
        <div className="p-4 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#9CAF88]/30 focus-within:border-[#9CAF88] transition-colors">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-poppins text-gray-600">Subtotal:</span>
          <span className="font-poppins font-semibold">£{amount.toFixed(2)}</span>
        </div>
        {orderType === 'delivery' && (
          <div className="flex items-center justify-between mb-2">
            <span className="font-poppins text-gray-600">Delivery:</span>
            <span className="font-poppins font-semibold">£2.50</span>
          </div>
        )}
        <div className="flex items-center justify-between text-lg pt-2 border-t border-gray-200">
          <span className="font-poppins font-bold text-gray-800">Total:</span>
          <span className="font-poppins font-bold text-[#9CAF88]">
            £{(amount + (orderType === 'delivery' ? 2.50 : 0)).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold py-4 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300 transform hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard size={20} />
            <span>Pay £{(amount + (orderType === 'delivery' ? 2.50 : 0)).toFixed(2)}</span>
          </>
        )}
      </button>

      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secure payment powered by Stripe</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Your payment information is encrypted and secure
        </p>
      </div>
    </form>
  )
}

export default StripeCheckoutForm