import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Navigation, MessageCircle } from 'lucide-react'
import ContactForm from '@/components/ContactForm'

const ContactSection = () => {
  const openWhatsApp = () => {
    window.open('https://wa.me/447123456789?text=Hello%20Clifton\'s%20Coffee%20Shop!', '_blank')
  }

  const openDirections = () => {
    window.open('https://maps.google.com/?q=Cogenhoe+Whiston+Village+Hall+Northamptonshire', '_blank')
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-[#9CAF88]/10 to-white rustic-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredericka text-5xl sm:text-6xl text-gray-800 mb-4">
            Find Us
          </h2>
          <p className="font-dancing text-2xl text-[#9CAF88] mb-8">
            Located in the heart of Cogenhoe & Whiston
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#9CAF88] to-[#D4A4A4] mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Location */}
            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-dm-serif text-2xl text-gray-800 mb-6 flex items-center">
                <MapPin className="mr-3 text-[#9CAF88]" size={28} />
                Our Location
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-poppins font-semibold text-gray-800">Clifton's Coffee Shop</p>
                  <p className="font-poppins text-gray-600">Inside Cogenhoe & Whiston Village Hall</p>
                  <p className="font-poppins text-gray-600">Northamptonshire</p>
                  <p className="font-poppins text-gray-600">United Kingdom</p>
                </div>
                <button 
                  onClick={openDirections}
                  className="flex items-center space-x-2 text-[#9CAF88] hover:text-[#9CAF88]/80 font-poppins font-semibold transition-colors"
                >
                  <Navigation size={16} />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-dm-serif text-2xl text-gray-800 mb-6">
                Get in Touch
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="text-[#25D366]" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-poppins font-semibold text-gray-800">WhatsApp</p>
                    <button 
                      onClick={openWhatsApp}
                      className="font-poppins text-[#25D366] hover:text-[#25D366]/80 transition-colors"
                    >
                      +44 7123 456789
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#9CAF88]/10 rounded-full flex items-center justify-center">
                    <Phone className="text-[#9CAF88]" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-poppins font-semibold text-gray-800">Phone</p>
                    <a 
                      href="tel:+441234567890"
                      className="font-poppins text-[#9CAF88] hover:text-[#9CAF88]/80 transition-colors"
                    >
                      +44 1234 567890
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#D4A4A4]/10 rounded-full flex items-center justify-center">
                    <Mail className="text-[#D4A4A4]" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-poppins font-semibold text-gray-800">Email</p>
                    <a 
                      href="mailto:hello@cliftonscoffee.com"
                      className="font-poppins text-[#D4A4A4] hover:text-[#D4A4A4]/80 transition-colors"
                    >
                      hello@cliftonscoffee.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-dm-serif text-2xl text-gray-800 mb-6 flex items-center">
                <Clock className="mr-3 text-[#FFD1A3]" size={28} />
                Opening Hours
              </h3>
              <div className="space-y-3 font-poppins">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Monday - Friday</span>
                  <span className="text-[#9CAF88] font-semibold">8:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Saturday</span>
                  <span className="text-[#9CAF88] font-semibold">8:00 AM - 3:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Sunday</span>
                  <span className="text-[#9CAF88] font-semibold">9:00 AM - 3:00 PM</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-[#FFD1A3]/10 rounded-lg">
                <p className="text-sm font-poppins text-gray-600">
                  🎅 Holiday hours may vary. Check our social media for updates!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Map and Quick Contact */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Map Placeholder */}
            <div className="glass-card rounded-2xl p-8 h-96">
              <div className="h-full bg-gradient-to-br from-[#9CAF88]/20 to-[#D4A4A4]/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9CAF88]/5 to-[#D4A4A4]/5 opacity-20" />
                <div className="text-center z-10">
                  <MapPin className="mx-auto mb-4 text-[#9CAF88]" size={48} />
                  <h4 className="font-poppins font-semibold text-gray-800 mb-2">
                    Interactive Map
                  </h4>
                  <p className="font-poppins text-gray-600 mb-4">
                    Cogenhoe & Whiston Village Hall
                  </p>
                  <button 
                    onClick={openDirections}
                    className="bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold px-6 py-3 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300"
                  >
                    View on Google Maps
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Contact Form */}
            <ContactForm className="" />

            {/* Social Links */}
            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-dm-serif text-xl text-gray-800 mb-4">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                {['📷', '📱', '👍'].map((icon, index) => (
                  <motion.button 
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 glass-card rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <span className="text-xl">{icon}</span>
                  </motion.button>
                ))}
              </div>
              <p className="text-sm font-poppins text-gray-600 mt-4">
                Stay updated with our latest news, special offers, and behind-the-scenes content!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection