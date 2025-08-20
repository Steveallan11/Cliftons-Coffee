import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Coffee, Users, Award } from 'lucide-react'

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-[#FFF8E1]/30 to-white rustic-texture">
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
            About Becki & Clifton's
          </h2>
          <p className="font-dancing text-2xl text-[#D4A4A4] mb-8">
            A story of passion, community, and great coffee
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#D4A4A4] to-[#9CAF88] mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Story Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Polaroid-style Photo */}
            <div className="relative max-w-sm mx-auto lg:mx-0">
              <div className="glass-card p-4 rounded-xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="w-full h-64 bg-gradient-to-br from-[#9CAF88] to-[#D4A4A4] rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <Users size={48} className="mx-auto mb-2" />
                    <p className="font-poppins text-sm">Becki's Photo</p>
                    <p className="font-poppins text-xs opacity-75">Coming Soon</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="font-dancing text-lg text-gray-700">"Serving with Love"</p>
                </div>
              </div>
            </div>

            {/* Handwritten Quote */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="glass-card rounded-xl p-6 border-l-4 border-[#D4A4A4]"
            >
              <blockquote className="font-dancing text-2xl text-gray-700 italic leading-relaxed">
                "Every cup tells a story, every cake brings joy. At Clifton's, we're not just serving food - we're creating moments that matter in the heart of our community."
              </blockquote>
              <div className="mt-4 text-right">
                <p className="font-poppins font-semibold text-[#9CAF88]">- Becki, Owner & Head Chef</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Story Text */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="glass-card rounded-xl p-8">
              <h3 className="font-dm-serif text-2xl text-gray-800 mb-4">
                Welcome to Our Story
              </h3>
              <div className="space-y-4 font-poppins text-gray-600 leading-relaxed">
                <p>
                  Nestled in the heart of Cogenhoe & Whiston Village Hall, Clifton's Coffee Shop 
                  represents more than just great food and coffee - it's a testament to community 
                  spirit and artisan passion.
                </p>
                <p>
                  Founded by Becki with a vision to create a warm, welcoming space where 
                  neighbors become friends, we've been serving homemade delights and 
                  perfectly brewed coffee to the Northamptonshire community.
                </p>
                <p>
                  From our signature Clifton's Big Breakfast to our handcrafted smoothies 
                  and artisan coffee blends, every item on our menu is prepared with 
                  care, using the finest local ingredients whenever possible.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl p-6 text-center hover-lift"
              >
                <Coffee className="mx-auto mb-3 text-[#9CAF88]" size={40} />
                <h4 className="font-poppins font-semibold text-gray-800 mb-2">Artisan Coffee</h4>
                <p className="text-sm font-poppins text-gray-600">
                  Expertly roasted beans, perfectly brewed for every taste
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl p-6 text-center hover-lift"
              >
                <Heart className="mx-auto mb-3 text-[#D4A4A4]" size={40} />
                <h4 className="font-poppins font-semibold text-gray-800 mb-2">Made with Love</h4>
                <p className="text-sm font-poppins text-gray-600">
                  Every dish prepared fresh daily with genuine care
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl p-6 text-center hover-lift"
              >
                <Users className="mx-auto mb-3 text-[#FFD1A3]" size={40} />
                <h4 className="font-poppins font-semibold text-gray-800 mb-2">Community Hub</h4>
                <p className="text-sm font-poppins text-gray-600">
                  Where locals gather, connect, and create memories
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl p-6 text-center hover-lift"
              >
                <Award className="mx-auto mb-3 text-[#9CAF88]" size={40} />
                <h4 className="font-poppins font-semibold text-gray-800 mb-2">Quality First</h4>
                <p className="text-sm font-poppins text-gray-600">
                  Using finest ingredients for exceptional taste
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Gallery Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="font-fredericka text-3xl text-center text-gray-800 mb-8">
            A Glimpse into Our World
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl p-3 hover-lift"
              >
                <div className="aspect-square bg-gradient-to-br from-[#9CAF88]/20 to-[#D4A4A4]/20 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Coffee className="mx-auto mb-2" size={32} />
                    <p className="text-xs font-poppins">Gallery Image {i}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection