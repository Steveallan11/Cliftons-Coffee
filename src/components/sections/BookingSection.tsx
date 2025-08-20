import React from 'react'
import { motion } from 'framer-motion'
import BookingForm from '@/components/BookingForm'

const BookingSection = () => {
  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-white to-[#9CAF88]/10 rustic-texture">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredericka text-5xl sm:text-6xl text-gray-800 mb-4">
            Book Your Table
          </h2>
          <p className="font-dancing text-2xl text-[#9CAF88] mb-8">
            Reserve your perfect spot at Clifton's
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#9CAF88] to-[#D4A4A4] mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Booking Form */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <BookingForm />
          </motion.div>

          {/* Information Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-dm-serif text-2xl text-gray-800 mb-6">
                Reservation Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9CAF88] rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-800">Opening Hours</h4>
                    <p className="font-poppins text-gray-600 text-sm">
                      Monday - Sunday: 8:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9CAF88] rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-800">Advance Booking</h4>
                    <p className="font-poppins text-gray-600 text-sm">
                      Tables can be booked up to 3 months in advance
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9CAF88] rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-800">Group Bookings</h4>
                    <p className="font-poppins text-gray-600 text-sm">
                      For parties over 8, please call us directly at +44 1234 567890
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9CAF88] rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-800">Confirmation</h4>
                    <p className="font-poppins text-gray-600 text-sm">
                      All bookings are subject to confirmation and availability
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9CAF88] rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-800">Cancellation</h4>
                    <p className="font-poppins text-gray-600 text-sm">
                      Please give us at least 2 hours notice for cancellations
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-dm-serif text-2xl text-gray-800 mb-6">
                Contact Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#9CAF88]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#9CAF88]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-poppins font-semibold text-gray-800">+44 1234 567890</p>
                    <p className="font-poppins text-gray-600 text-sm">Call us directly</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#9CAF88]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#9CAF88]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-poppins font-semibold text-gray-800">bookings@cliftonscoffee.com</p>
                    <p className="font-poppins text-gray-600 text-sm">Email us your request</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default BookingSection