import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageCircle, Phone, Mail, MapPin } from 'lucide-react'
import { messagesService } from '@/utils/messagesService'
import toast from 'react-hot-toast'

interface ContactFormProps {
  className?: string
}

const ContactForm: React.FC<ContactFormProps> = ({ className = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await messagesService.submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject || 'Website Contact',
        message: formData.message
      })

      if (result.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        toast.error(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
      <div className="text-center mb-8">
        <MessageCircle className="w-12 h-12 text-[#9CAF88] mx-auto mb-4" />
        <h3 className="text-2xl font-fredericka text-gray-800 mb-2">Get in Touch</h3>
        <p className="text-gray-600 font-poppins">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88]/20 focus:border-[#9CAF88] transition-colors"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88]/20 focus:border-[#9CAF88] transition-colors"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88]/20 focus:border-[#9CAF88] transition-colors"
              placeholder="Your phone number"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88]/20 focus:border-[#9CAF88] transition-colors"
              placeholder="What's this about?"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAF88]/20 focus:border-[#9CAF88] transition-colors resize-none"
            placeholder="Tell us how we can help you..."
          />
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#9CAF88] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#8A9F78] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Contact Information */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Phone className="w-8 h-8 text-[#9CAF88] mb-2" />
            <p className="text-sm font-medium text-gray-700">Phone</p>
            <p className="text-sm text-gray-600">01234 567890</p>
          </div>
          <div className="flex flex-col items-center">
            <Mail className="w-8 h-8 text-[#9CAF88] mb-2" />
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-sm text-gray-600">hello@cliftonscoffee.com</p>
          </div>
          <div className="flex flex-col items-center">
            <MapPin className="w-8 h-8 text-[#9CAF88] mb-2" />
            <p className="text-sm font-medium text-gray-700">Location</p>
            <p className="text-sm text-gray-600">123 High Street, Clifton</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactForm