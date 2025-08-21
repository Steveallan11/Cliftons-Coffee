import React from 'react'
import { motion } from 'framer-motion'
import { Coffee, Heart, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-[#9CAF88] rounded-full flex items-center justify-center">
                <Coffee className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-fredericka text-2xl">Clifton's Coffee Shop</h3>
                <p className="text-gray-400 text-sm">Cogenhoe & Whiston Village Hall</p>
              </div>
            </div>
            <p className="font-poppins text-gray-300 leading-relaxed mb-6">
              Where rustic charm meets artisan coffee. Join us for homemade cakes, 
              perfectly brewed coffee, and a warm community atmosphere in the heart 
              of Northamptonshire.
            </p>
            <div className="flex space-x-4">
              <motion.a 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://instagram.com/cliftonscoffee" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E4405F] transition-colors"
              >
                <Instagram size={18} />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://facebook.com/cliftonscoffee" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1877F2] transition-colors"
              >
                <Facebook size={18} />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://twitter.com/cliftonscoffee" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1DA1F2] transition-colors"
              >
                <Twitter size={18} />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="font-poppins font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', action: () => scrollToSection('hero') },
                { label: 'Menu', action: () => scrollToSection('menu') },
                { label: 'About Us', action: () => scrollToSection('about') },
                { label: 'Book Table', action: () => scrollToSection('booking') },
                { label: 'Contact', action: () => scrollToSection('contact') }
              ].map((link) => (
                <li key={link.label}>
                  <button 
                    onClick={link.action}
                    className="font-poppins text-gray-300 hover:text-[#9CAF88] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-poppins font-semibold text-lg mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="text-[#9CAF88]" size={18} />
                <span className="font-poppins text-gray-300 text-sm">
                  Cogenhoe & Whiston Village Hall, Northamptonshire
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-[#9CAF88]" size={18} />
                <a 
                  href="tel:+447361258652" 
                  className="font-poppins text-gray-300 hover:text-[#9CAF88] transition-colors text-sm"
                >
                  07361 258652
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-[#9CAF88]" size={18} />
                <a 
                  href="mailto:hello@cliftonscoffee.com" 
                  className="font-poppins text-gray-300 hover:text-[#9CAF88] transition-colors text-sm"
                >
                  hello@cliftonscoffee.com
                </a>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h5 className="font-poppins font-semibold text-[#FFD1A3] mb-2">Opening Hours</h5>
              <div className="space-y-1 text-xs font-poppins text-gray-400">
                <div>Mon-Tue: CLOSED</div>
                <div>Wed-Fri: 8:30AM-4:30PM</div>
                <div>Sat-Sun: 8AM-4PM</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Coming Soon Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="glass-dark rounded-2xl p-8">
            <h4 className="font-fredericka text-3xl text-center mb-6 text-[#FFD1A3]">
              Coming Soon
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#9CAF88] to-[#9CAF88]/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-white" size={24} />
                </div>
                <h5 className="font-poppins font-semibold mb-2">Loyalty Program</h5>
                <p className="text-sm text-gray-400">Earn points with every visit and unlock exclusive rewards</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D4A4A4] to-[#D4A4A4]/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="text-white" size={24} />
                </div>
                <h5 className="font-poppins font-semibold mb-2">Mobile App</h5>
                <p className="text-sm text-gray-400">Order ahead and skip the queue with our upcoming mobile app</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD1A3] to-[#FFD1A3]/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-white" size={24} />
                </div>
                <h5 className="font-poppins font-semibold mb-2">Delivery Partners</h5>
                <p className="text-sm text-gray-400">Partnering with local delivery services for wider reach</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="glass-card rounded-2xl p-8 text-center">
            <h4 className="font-dm-serif text-2xl mb-4">
              Stay Updated with Clifton's
            </h4>
            <p className="font-poppins text-gray-300 mb-6">
              Subscribe to our newsletter for special offers, new menu items, and community events
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto space-y-3 sm:space-y-0 sm:space-x-3">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#9CAF88]/30 focus:border-[#9CAF88] transition-colors"
              />
              <button className="bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold px-6 py-3 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <div className="text-center md:text-left">
            <p className="font-poppins text-gray-400 text-sm">
              © {currentYear} Clifton's Coffee Shop. All rights reserved.
            </p>
            <p className="font-poppins text-gray-500 text-xs mt-1">
              Made with 💚 in Northamptonshire
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/admin-login" className="font-poppins text-gray-400 hover:text-[#9CAF88] transition-colors text-sm">
              Admin Login
            </Link>
            <button className="font-poppins text-gray-400 hover:text-[#9CAF88] transition-colors text-sm">
              Privacy Policy
            </button>
            <button className="font-poppins text-gray-400 hover:text-[#9CAF88] transition-colors text-sm">
              Terms of Service
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer