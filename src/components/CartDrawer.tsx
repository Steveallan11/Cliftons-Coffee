import React from 'react'
import { X, Plus, Minus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { motion, AnimatePresence } from 'framer-motion'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { state, updateQuantity, removeItem, clearCart } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (state.items.length > 0) {
      navigate('/checkout')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" 
            onClick={onClose}
          />
          
          {/* Cart Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#9CAF88]/10 to-[#D4A4A4]/10">
              <h2 className="text-2xl font-fredericka text-gray-800">Your Order</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {state.items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.1M7 13v6a2 2 0 002 2h6M15 16a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-500 font-poppins">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-2">Add some delicious items to get started!</p>
                </div>
              ) : (
                <>
                  {state.items.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-xl p-4 hover-lift"
                    >
                      <div className="flex items-start space-x-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-poppins font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-[#9CAF88] font-semibold">£{item.price.toFixed(2)}</p>
                          {item.special_requests && (
                            <p className="text-xs text-gray-500 mt-1">Note: {item.special_requests}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Minus size={16} className="text-gray-600" />
                          </button>
                          <span className="font-poppins font-semibold text-gray-800 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Plus size={16} className="text-gray-600" />
                          </button>
                        </div>
                        <p className="font-poppins font-semibold text-gray-800">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Clear Cart */}
                  <button 
                    onClick={clearCart}
                    className="w-full text-center text-red-500 hover:text-red-700 font-poppins text-sm py-2 transition-colors"
                  >
                    Clear Cart
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-poppins font-semibold text-gray-800">Total:</span>
                  <span className="font-poppins font-bold text-xl text-[#9CAF88]">£{state.total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-[#9CAF88] to-[#9CAF88]/90 text-white font-poppins font-semibold py-3 rounded-xl hover:from-[#9CAF88]/90 hover:to-[#9CAF88] transition-all duration-300 transform hover:scale-[0.98]"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer