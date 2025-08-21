import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, MapPin, DollarSign, Users, CreditCard, Mail, Phone, User as UserIcon } from 'lucide-react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Event } from '@/utils/contentManagementService'
import { ticketPurchaseService, TicketPurchaseData } from '@/utils/ticketPurchaseService'
import toast from 'react-hot-toast'

interface TicketPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
  onSuccess: (confirmationData: any) => void
}

const TicketPurchaseModal: React.FC<TicketPurchaseModalProps> = ({
  isOpen,
  onClose,
  event,
  onSuccess
}) => {
  const [quantity, setQuantity] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment'>('details')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  const stripe = useStripe()
  const elements = useElements()

  const totalAmount = event.ticket_price ? event.ticket_price * quantity : 0
  const availableTickets = event.max_attendees ? event.max_attendees - (event.current_attendees || 0) : 999
  const maxQuantity = Math.min(availableTickets, 10)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    return new Date(2000, 0, 1, parseInt(hours), parseInt(minutes)).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleNextStep = async () => {
    if (paymentStep === 'details') {
      // Validate form
      if (!customerName.trim() || !customerEmail.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        toast.error('Please enter a valid email address')
        return
      }

      if (quantity <= 0 || quantity > maxQuantity) {
        toast.error(`Please select between 1 and ${maxQuantity} tickets`)
        return
      }

      setIsProcessing(true)
      try {
        // Create payment intent
        const purchaseData: TicketPurchaseData = {
          eventId: event.id!,
          quantity,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim() || undefined
        }

        const result = await ticketPurchaseService.createPaymentIntent(purchaseData)
        
        if (result.success && result.data) {
          setClientSecret(result.data.clientSecret)
          setPaymentIntentId(result.data.paymentIntentId)
          setPaymentStep('payment')
        } else {
          throw new Error(result.error || 'Failed to setup payment')
        }
      } catch (error: any) {
        console.error('Error creating payment intent:', error)
        toast.error(error.message || 'Failed to setup payment. Please try again.')
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handlePayment = async () => {
    if (!stripe || !elements || !clientSecret) {
      toast.error('Payment system not ready. Please try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error('Payment form not found. Please refresh and try again.')
      return
    }

    setIsProcessing(true)
    try {
      // Confirm payment with Stripe
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone || undefined
          }
        }
      })

      if (paymentError) {
        throw new Error(paymentError.message || 'Payment failed')
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm ticket purchase in our system
        const confirmResult = await ticketPurchaseService.confirmTicketPurchase(paymentIntent.id)
        
        if (confirmResult.success && confirmResult.data) {
          toast.success('Tickets purchased successfully!')
          onSuccess(confirmResult.data)
          resetForm()
          onClose()
        } else {
          throw new Error(confirmResult.error || 'Failed to complete ticket purchase')
        }
      } else {
        throw new Error('Payment was not completed successfully')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setQuantity(1)
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setPaymentStep('details')
    setClientSecret(null)
    setPaymentIntentId(null)
    setIsProcessing(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleBackStep = () => {
    setPaymentStep('details')
    setClientSecret(null)
    setPaymentIntentId(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-xl rounded-2xl transform transition-all sm:max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-fredericka text-gray-800">
                  {paymentStep === 'details' ? 'Book Event Tickets' : 'Complete Payment'}
                </h3>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Event Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  {event.start_time && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {formatTime(event.start_time)}
                        {event.end_time && ` - ${formatTime(event.end_time)}`}
                      </span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {paymentStep === 'details' ? (
                <div className="space-y-6">
                  {/* Quantity Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Tickets
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg font-semibold">-</span>
                      </button>
                      <span className="text-xl font-semibold text-gray-800 min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg font-semibold">+</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {availableTickets} tickets available
                    </p>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-800">Contact Information</h5>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent"
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-[#9CAF88]/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Ticket Price</span>
                      <span className="text-gray-800">£{event.ticket_price?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Quantity</span>
                      <span className="text-gray-800">{quantity}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-800">Total</span>
                        <span className="text-xl font-bold text-[#9CAF88]">£{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleNextStep}
                    disabled={isProcessing || !customerName.trim() || !customerEmail.trim()}
                    className="w-full bg-[#9CAF88] hover:bg-[#8A9B7A] disabled:bg-gray-300 text-white font-medium py-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Continue to Payment</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Payment Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Customer</span>
                      <span className="text-gray-800">{customerName}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Tickets</span>
                      <span className="text-gray-800">{quantity} × £{event.ticket_price?.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">Total</span>
                        <span className="text-lg font-bold text-[#9CAF88]">£{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Element */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Details
                    </label>
                    <div className="p-4 border border-gray-300 rounded-lg">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#374151',
                              '::placeholder': {
                                color: '#9CA3AF',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleBackStep}
                      disabled={isProcessing}
                      className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 py-3 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing || !stripe}
                      className="flex-2 bg-[#9CAF88] hover:bg-[#8A9B7A] disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Pay £{totalAmount.toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default TicketPurchaseModal
