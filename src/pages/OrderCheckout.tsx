import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  MapPin, 
  Car, 
  CheckCircle, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MessageSquare 
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'
import StripeCheckoutForm from '@/components/StripeCheckoutForm'
import toast from 'react-hot-toast'

type OrderType = 'collection' | 'delivery'
type Step = 'details' | 'payment' | 'success'

const OrderCheckout = () => {
  const { state, clearCart } = useCart()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>('details')
  const [orderType, setOrderType] = useState<OrderType>('collection')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [useRealStripe, setUseRealStripe] = useState(false)
  
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  })
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: '',
    postcode: '',
    instructions: ''
  })
  
  const [specialInstructions, setSpecialInstructions] = useState('')

  useEffect(() => {
    if (state.items.length === 0) {
      navigate('/')
    }
    // Check if Stripe is properly configured
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (stripeKey && stripeKey !== 'your_stripe_publishable_key' && !stripeKey.includes('placeholder')) {
      setUseRealStripe(true)
    }
  }, [state.items, navigate])

  const handleCustomerDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerDetails(prev => ({ ...prev, [name]: value }))
  }

  const handleDeliveryAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDeliveryAddress(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!customerDetails.name || !customerDetails.email) {
      toast.error('Please fill in your name and email address')
      return false
    }

    if (orderType === 'delivery' && (!deliveryAddress.address || !deliveryAddress.postcode)) {
      toast.error('Please provide a complete delivery address')
      return false
    }

    return true
  }

  const proceedToPayment = () => {
    if (!validateForm()) return
    setCurrentStep('payment')
  }

  // Simulate payment for demo when Stripe is not configured
  const simulatePayment = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      // Import the database service
      const { createOrder } = await import('@/utils/databaseService')
      
      // Create order data
      const orderData = {
        customer_email: customerDetails.email,
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone || undefined,
        order_type: orderType,
        total_amount: state.total + (orderType === 'delivery' ? 2.50 : 0),
        special_instructions: specialInstructions || undefined,
        delivery_address: orderType === 'delivery' 
          ? `${deliveryAddress.address}, ${deliveryAddress.postcode}${deliveryAddress.instructions ? ' - ' + deliveryAddress.instructions : ''}` 
          : undefined,
        items: state.items
      }
      
      // Create the order in database
      const result = await createOrder(orderData)
      
      if (result.success) {
        setOrderId(result.orderId!)
        clearCart()
        setCurrentStep('success')
        toast.success('Order placed successfully!')
      } else {
        toast.error(result.error || 'Failed to create order')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeSuccess = (newOrderId: number) => {
    setOrderId(newOrderId)
    clearCart()
    setCurrentStep('success')
  }

  const handleStripeError = (error: string) => {
    toast.error(error)
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="glass-card rounded-2xl p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CheckCircle className="mx-auto mb-6 text-green-500" size={80} />
              </motion.div>
              
              <h1 className="font-fredericka text-4xl text-gray-800 mb-4">
                Order Confirmed!
              </h1>
              
              <p className="font-poppins text-gray-600 mb-8">
                Thank you for your order! We've received your {useRealStripe ? 'payment' : 'request'} and will start preparing your items right away.
              </p>
              
              <div className="glass rounded-xl p-6 mb-8">
                <h3 className="font-poppins font-semibold text-lg mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-semibold">#{orderId || 'CLF-' + Date.now()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Type:</span>
                    <span className="font-semibold capitalize">{orderType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold text-[#9CAF88]">
                      £{(state.total + (orderType === 'delivery' ? 2.50 : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 text-sm font-poppins text-gray-600">
                <p>
                  📱 You'll receive a confirmation email shortly with your order details
                </p>
                <p>
                  {orderType === 'collection' 
                    ? '⏰ Your order will be ready for collection in 15-20 minutes'
                    : '🚚 Your order will be delivered within 45-60 minutes'
                  }
                </p>
                <p>
                  📞 If you have any questions, call us at +44 1234 567890
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                <button 
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold px-8 py-3 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300"
                >
                  Return to Home
                </button>
                <button 
                  onClick={() => window.print()}
                  className="glass border border-[#9CAF88]/30 text-[#9CAF88] font-poppins font-semibold px-8 py-3 rounded-xl hover:bg-[#9CAF88]/10 transition-all duration-300"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-[#9CAF88] hover:text-[#9CAF88]/80 transition-colors mb-4 mx-auto"
          >
            <ArrowLeft size={20} />
            <span className="font-poppins">Back to Menu</span>
          </button>
          
          <h1 className="font-fredericka text-4xl text-gray-800 mb-2">
            Complete Your Order
          </h1>
          <p className="font-poppins text-gray-600">
            Just a few more details and your delicious food will be on its way!
          </p>
          
          {!useRealStripe && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-poppins text-yellow-800">
                💡 This is a demo checkout. Real payments require Stripe configuration.
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Order Type Selection */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-dm-serif text-xl text-gray-800 mb-4">
                Order Type
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setOrderType('collection')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    orderType === 'collection'
                      ? 'border-[#9CAF88] bg-[#9CAF88]/10 text-[#9CAF88]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Car className="mx-auto mb-2" size={24} />
                  <p className="font-poppins font-semibold">Collection</p>
                  <p className="text-xs mt-1">Ready in 15-20 mins</p>
                </button>
                
                <button 
                  onClick={() => setOrderType('delivery')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    orderType === 'delivery'
                      ? 'border-[#9CAF88] bg-[#9CAF88]/10 text-[#9CAF88]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <MapPin className="mx-auto mb-2" size={24} />
                  <p className="font-poppins font-semibold">Delivery</p>
                  <p className="text-xs mt-1">45-60 mins</p>
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-dm-serif text-xl text-gray-800 mb-4">
                Your Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-poppins font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      name="name"
                      value={customerDetails.name}
                      onChange={handleCustomerDetailsChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9CAF88]/30 focus:border-[#9CAF88] transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-poppins font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email"
                      name="email"
                      value={customerDetails.email}
                      onChange={handleCustomerDetailsChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9CAF88]/30 focus:border-[#9CAF88] transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-poppins font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="tel"
                      name="phone"
                      value={customerDetails.phone}
                      onChange={handleCustomerDetailsChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9CAF88]/30 focus:border-[#9CAF88] transition-colors"
                      placeholder="07123 456789"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {orderType === 'delivery' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-dm-serif text-xl text-gray-800 mb-4">
                  Delivery Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-poppins font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input 
                      type="text"
                      name="address"
                      value={deliveryAddress.address}
                      onChange={handleDeliveryAddressChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9CAF88]/30 focus:border-[#9CAF88] transition-colors"
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-poppins font-medium text-gray-700 mb-2">
                      Postcode *
                    </label>
                    <input 
                      type="text"
                      name="postcode"
                      value={deliveryAddress.postcode}
                      onChange={handleDeliveryAddressChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9CAF88]/30 focus:border-[#9CAF88] transition-colors"
                      placeholder="NN7 4JX"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-poppins font-medium text-gray-700 mb-2">
                      Delivery Instructions
                    </label>
                    <textarea 
                      name="instructions"
                      value={deliveryAddress.instructions}
                      onChange={handleDeliveryAddressChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9CAF88]/30 focus:border-[#9CAF88] transition-colors resize-none"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Special Instructions */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-dm-serif text-xl text-gray-800 mb-4">
                Special Instructions
              </h3>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea 
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9CAF88]/30 focus:border-[#9CAF88] transition-colors resize-none"
                  placeholder="Any special requests for your order..."
                />
              </div>
            </div>

            {/* Proceed to Payment */}
            {currentStep === 'details' && (
              <div className="text-center">
                <button 
                  onClick={proceedToPayment}
                  className="bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold px-8 py-3 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300"
                >
                  Proceed to Payment
                </button>
              </div>
            )}

            {/* Payment Form */}
            {currentStep === 'payment' && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-dm-serif text-xl text-gray-800 mb-6">
                  Payment Details
                </h3>
                
                {useRealStripe ? (
                  <StripeCheckoutForm
                    amount={state.total}
                    cartItems={state.items}
                    customerDetails={customerDetails}
                    orderType={orderType}
                    deliveryAddress={orderType === 'delivery' ? `${deliveryAddress.address}, ${deliveryAddress.postcode}` : undefined}
                    specialInstructions={specialInstructions || deliveryAddress.instructions || undefined}
                    onSuccess={handleStripeSuccess}
                    onError={handleStripeError}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm font-poppins text-blue-800">
                        🧪 Demo Mode: This is a simulated checkout process. 
                        No real payment will be processed.
                      </p>
                    </div>
                    
                    <div className="glass rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-poppins text-gray-600">Subtotal:</span>
                        <span className="font-poppins font-semibold">£{state.total.toFixed(2)}</span>
                      </div>
                      {orderType === 'delivery' && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-poppins text-gray-600">Delivery:</span>
                          <span className="font-poppins font-semibold">£2.50</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg pt-2 border-t border-gray-200">
                        <span className="font-poppins font-bold text-gray-800">Total:</span>
                        <span className="font-poppins font-bold text-[#9CAF88]">
                          £{(state.total + (orderType === 'delivery' ? 2.50 : 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={simulatePayment}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold py-4 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300 transform hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="spinner" />
                          <span>Processing Demo Order...</span>
                        </>
                      ) : (
                        <span>Complete Demo Order</span>
                      )}
                    </button>
                  </div>
                )}
                
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setCurrentStep('details')}
                    className="text-sm font-poppins text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ← Back to Details
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-8 h-fit"
          >
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ShoppingCart className="text-[#9CAF88]" size={24} />
                <h3 className="font-dm-serif text-xl text-gray-800">Order Summary</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-poppins font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.special_requests && (
                        <p className="text-xs text-gray-500">Note: {item.special_requests}</p>
                      )}
                    </div>
                    <p className="font-poppins font-semibold text-gray-800">
                      £{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-poppins text-gray-600">Subtotal:</span>
                  <span className="font-poppins font-semibold">£{state.total.toFixed(2)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between items-center">
                    <span className="font-poppins text-gray-600">Delivery:</span>
                    <span className="font-poppins font-semibold">£2.50</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg pt-2 border-t">
                  <span className="font-poppins font-bold text-gray-800">Total:</span>
                  <span className="font-poppins font-bold text-[#9CAF88]">
                    £{(state.total + (orderType === 'delivery' ? 2.50 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default OrderCheckout