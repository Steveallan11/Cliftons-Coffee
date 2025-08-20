import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, Mail, User, Phone, MessageSquare, CheckCircle } from 'lucide-react'
import { createBooking, BookingData } from '@/utils/databaseService'
import toast from 'react-hot-toast'

interface BookingFormProps {
  onBookingComplete?: (bookingId: number) => void
}

const BookingForm: React.FC<BookingFormProps> = ({ onBookingComplete }) => {
  const [loading, setLoading] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingId, setBookingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    party_size: 2,
    booking_date: '',
    booking_time: '',
    special_requests: ''
  })

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Generate time slots
  const getTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = `${hour}:${minute === 0 ? '00' : '30'} ${hour < 12 ? 'AM' : 'PM'}`
        slots.push({ value: time, display: displayTime })
      }
    }
    return slots
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.customer_name.trim()) {
      toast.error('Please enter your name')
      return false
    }
    if (!formData.customer_email.trim()) {
      toast.error('Please enter your email address')
      return false
    }
    if (!formData.booking_date) {
      toast.error('Please select a booking date')
      return false
    }
    if (!formData.booking_time) {
      toast.error('Please select a booking time')
      return false
    }
    if (formData.party_size < 1 || formData.party_size > 12) {
      toast.error('Party size must be between 1 and 12 people')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const bookingData: BookingData = {
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim() || undefined,
        party_size: formData.party_size,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        special_requests: formData.special_requests.trim() || undefined
      }

      const result = await createBooking(bookingData)
      
      if (result.success) {
        setBookingId(result.bookingId!)
        setBookingComplete(true)
        toast.success('Table booking confirmed!')
        
        if (onBookingComplete) {
          onBookingComplete(result.bookingId!)
        }
      } else {
        toast.error(result.error || 'Failed to create booking')
      }
    } catch (error: any) {
      console.error('Booking submission error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (bookingComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
        <h3 className="font-fredericka text-2xl text-gray-800 mb-2">
          Booking Confirmed!
        </h3>
        <p className="font-poppins text-gray-600 mb-6">
          Your table has been reserved. We look forward to seeing you!
        </p>
        <div className="glass rounded-xl p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Booking ID:</span>
              <span className="font-semibold">#{bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-semibold">{new Date(formData.booking_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-semibold">{formData.booking_time}</span>
            </div>
            <div className="flex justify-between">
              <span>Party Size:</span>
              <span className="font-semibold">{formData.party_size} people</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            setBookingComplete(false)
            setFormData({
              customer_name: '',
              customer_email: '',
              customer_phone: '',
              party_size: 2,
              booking_date: '',
              booking_time: '',
              special_requests: ''
            })
          }}
          className="bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold px-6 py-3 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300"
        >
          Book Another Table
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <h2 className="font-fredericka text-2xl text-gray-800 mb-6">
        Reserve Your Table
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-poppins font-medium text-gray-700 mb-2">
              <User className="inline mr-2" size={16} />
              Full Name *
            </label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent font-poppins"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <label className="block font-poppins font-medium text-gray-700 mb-2">
              <Mail className="inline mr-2" size={16} />
              Email Address *
            </label>
            <input
              type="email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent font-poppins"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-poppins font-medium text-gray-700 mb-2">
              <Phone className="inline mr-2" size={16} />
              Phone Number
            </label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent font-poppins"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div>
            <label className="block font-poppins font-medium text-gray-700 mb-2">
              <Users className="inline mr-2" size={16} />
              Party Size *
            </label>
            <select
              name="party_size"
              value={formData.party_size}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent font-poppins"
              required
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'person' : 'people'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-poppins font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" size={16} />
              Booking Date *
            </label>
            <input
              type="date"
              name="booking_date"
              value={formData.booking_date}
              onChange={handleInputChange}
              min={getMinDate()}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent font-poppins"
              required
            />
          </div>
          
          <div>
            <label className="block font-poppins font-medium text-gray-700 mb-2">
              <Clock className="inline mr-2" size={16} />
              Booking Time *
            </label>
            <select
              name="booking_time"
              value={formData.booking_time}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent font-poppins"
              required
            >
              <option value="">Select a time</option>
              {getTimeSlots().map(slot => (
                <option key={slot.value} value={slot.value}>
                  {slot.display}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block font-poppins font-medium text-gray-700 mb-2">
            <MessageSquare className="inline mr-2" size={16} />
            Special Requests
          </label>
          <textarea
            name="special_requests"
            value={formData.special_requests}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent font-poppins resize-none"
            placeholder="Any special requirements or requests?"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold py-4 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="spinner" />
              <span>Booking Table...</span>
            </div>
          ) : (
            'Reserve Table'
          )}
        </button>
      </form>
    </motion.div>
  )
}

export default BookingForm