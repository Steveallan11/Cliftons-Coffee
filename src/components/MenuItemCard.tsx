import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { MenuItem } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import toast from 'react-hot-toast'

interface MenuItemCardProps {
  item: MenuItem
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const [quantity, setQuantity] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [showCustomization, setShowCustomization] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(item, quantity, specialRequests.trim() || undefined)
    toast.success(`Added ${item.name} to cart!`, {
      icon: '🛒',
      style: {
        background: 'rgba(156, 175, 136, 0.1)',
        borderColor: 'rgba(156, 175, 136, 0.3)'
      }
    })
    setQuantity(1)
    setSpecialRequests('')
    setShowCustomization(false)
  }

  const handleQuickAdd = () => {
    addItem(item, 1)
    toast.success(`Added ${item.name} to cart!`, {
      icon: '🛒'
    })
  }

  return (
    <motion.div 
      className="glass-card rounded-2xl overflow-hidden hover-lift group transition-all duration-300"
      whileHover={{ y: -4 }}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Add Button */}
        <button 
          onClick={handleQuickAdd}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
        >
          <Plus size={20} className="text-[#9CAF88]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-poppins font-bold text-xl text-gray-800 mb-2">
            {item.name}
          </h3>
          <p className="font-poppins text-gray-600 text-sm leading-relaxed mb-3">
            {item.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-[#9CAF88]">
              {item.priceRange || `£${item.price.toFixed(2)}`}
            </span>
            {item.available ? (
              <span className="glass rounded-full px-3 py-1 text-xs font-poppins text-green-700 bg-green-50/50">
                Available
              </span>
            ) : (
              <span className="glass rounded-full px-3 py-1 text-xs font-poppins text-red-700 bg-red-50/50">
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Action Area */}
        {item.available && (
          <div className="space-y-4">
            {!showCustomization ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleQuickAdd}
                  className="flex-1 bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold py-3 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300 transform hover:scale-[0.98]"
                >
                  Quick Add
                </button>
                <button 
                  onClick={() => setShowCustomization(true)}
                  className="px-4 py-3 glass border border-[#9CAF88]/30 text-[#9CAF88] font-poppins font-semibold rounded-xl hover:bg-[#9CAF88]/10 transition-all duration-300"
                >
                  Customize
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="font-poppins font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Minus size={16} className="text-gray-600" />
                    </button>
                    <span className="font-poppins font-semibold text-lg min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Plus size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block font-poppins font-medium text-gray-700 mb-2">
                    Special Requests:
                  </label>
                  <textarea 
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special instructions..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9CAF88]/30 focus:border-[#9CAF88] transition-colors resize-none"
                    rows={2}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold py-3 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300 transform hover:scale-[0.98]"
                  >
                    Add to Cart - £{(item.price * quantity).toFixed(2)}
                  </button>
                  <button 
                    onClick={() => setShowCustomization(false)}
                    className="px-4 py-3 glass border border-gray-300 text-gray-600 font-poppins rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default MenuItemCard