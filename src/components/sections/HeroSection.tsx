import React from 'react'
import { motion } from 'framer-motion'
import { Coffee, Heart, MapPin, Clock } from 'lucide-react'

const HeroSection = () => {
  const scrollToMenu = () => {
    const element = document.getElementById('menu')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToBooking = () => {
    const element = document.getElementById('booking')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/coffee-shop-hero-atmosphere.png')`,
          backgroundBlendMode: 'multiply'
        }}
      />

      {/* Rustic Texture Overlay */}
      <div className="absolute inset-0 rustic-texture opacity-30" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Glassmorphism Card */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-dark rounded-3xl p-8 sm:p-12 mb-8"
        >
          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-fredericka text-4xl sm:text-6xl lg:text-7xl mb-6 text-shadow"
          >
            Clifton's Coffee Shop
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-dancing text-2xl sm:text-3xl mb-4 text-[#FFD1A3]"
          >
            Where Rustic Charm Meets Artisan Coffee
          </motion.p>
          
          {/* Location */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center space-x-2 mb-8"
          >
            <MapPin size={20} className="text-[#9CAF88]" />
            <span className="font-poppins text-lg">Cogenhoe & Whiston Village Hall, Northamptonshire</span>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10"
          >
            <div className="glass-card rounded-xl p-4 text-center">
              <Coffee className="mx-auto mb-2 text-[#9CAF88]" size={32} />
              <p className="font-poppins text-sm">Artisan Coffee & Homemade Cakes</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Heart className="mx-auto mb-2 text-[#D4A4A4]" size={32} />
              <p className="font-poppins text-sm">Community-Focused Cafe</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Clock className="mx-auto mb-2 text-[#FFD1A3]" size={32} />
              <p className="font-poppins text-sm">Fresh Breakfast & Lunch Daily</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <button 
              onClick={scrollToMenu}
              className="group px-8 py-4 bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold rounded-2xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300 transform hover:scale-105 hover-lift"
            >
              <span className="flex items-center space-x-2">
                <Coffee size={20} />
                <span>Order Online</span>
              </span>
            </button>
            
            <button 
              onClick={scrollToBooking}
              className="group px-8 py-4 glass-card border-2 border-white/30 text-white font-poppins font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover-lift"
            >
              <span className="flex items-center space-x-2">
                <MapPin size={20} />
                <span>Book a Table</span>
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Opening Hours */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="glass-card rounded-xl p-6 max-w-md mx-auto"
        >
          <h3 className="font-poppins font-semibold text-lg mb-4 text-center">Opening Hours</h3>
          <div className="space-y-2 text-sm font-poppins">
            <div className="flex justify-between">
              <span>Monday - Tuesday:</span>
              <span className="text-red-400">CLOSED</span>
            </div>
            <div className="flex justify-between">
              <span>Wednesday - Friday:</span>
              <span className="text-[#FFD1A3]">8:30 AM - 4:30 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday - Sunday:</span>
              <span className="text-[#FFD1A3]">8:00 AM - 4:00 PM</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce-gentle"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-xs font-poppins">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection