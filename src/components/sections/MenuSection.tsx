import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MenuItem } from '@/lib/supabase'
import MenuItemCard from '@/components/MenuItemCard'
import { getMenuItems } from '@/utils/menuDataImport'

const categories = [
  { id: 'breakfast', name: 'Breakfast', icon: '🥓' },
  { id: 'extras', name: 'Extras', icon: '🍳' },
  { id: 'lunch', name: 'Lunch', icon: '🥪' },
  { id: 'cakes', name: 'Cakes & Bakes', icon: '🍰' },
  { id: 'milkshakes', name: 'Milkshakes', icon: '🥤' },
  { id: 'smoothies', name: 'Smoothies', icon: '🍓' },
  { id: 'drinks', name: 'Hot & Cold Drinks', icon: '☕' }
]

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState('breakfast')
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<'supabase' | 'static' | 'unknown'>('unknown')

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await getMenuItems()
        setMenuData(data)
        
        // Check if we have data and determine source
        if (Object.keys(data).length > 0) {
          // If the first item has a numeric ID > 100, it's likely from Supabase
          const firstCategory = Object.keys(data)[0]
          const firstItem = data[firstCategory]?.[0]
          setDataSource(firstItem && firstItem.id > 100 ? 'supabase' : 'static')
        }
      } catch (error) {
        console.error('Error loading menu:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [])

  const currentItems = menuData[activeCategory] || []

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-[#FFF8E1]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9CAF88]/30 border-t-[#9CAF88] mx-auto mb-4" />
            <p className="font-poppins text-gray-600">Loading our delicious menu...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="menu" className="py-20 bg-gradient-to-b from-white to-[#FFF8E1]/30 rustic-texture">
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
            Our Menu
          </h2>
          <p className="font-dancing text-2xl text-[#9CAF88] mb-8">
            Homemade with love, served with pride
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#9CAF88] to-[#D4A4A4] mx-auto rounded-full" />
          
          {/* Data source indicator */}
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              dataSource === 'supabase' 
                ? 'bg-green-100 text-green-800' 
                : dataSource === 'static' 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {dataSource === 'supabase' && '🔄 Live Menu'}
              {dataSource === 'static' && '📋 Static Menu'}
              {dataSource === 'unknown' && '❓ Loading...'}
            </span>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="menu-tabs justify-center mb-4 pb-2">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setActiveCategory(category.id)}
                className={`menu-tab px-4 py-3 mx-1 rounded-xl border-2 transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'active glass-card border-[#9CAF88]/40 text-gray-800 shadow-lg'
                    : 'glass border-white/30 hover:border-[#9CAF88]/20 hover:bg-white/20 text-gray-700'
                }`}
              >
                <span className="flex flex-col items-center space-y-1">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-poppins text-sm font-medium">{category.name}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Menu Items Grid */}
        <motion.div 
          key={activeCategory}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="menu-grid"
        >
          {currentItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MenuItemCard item={item} />
            </motion.div>
          ))}
        </motion.div>

        {/* No items message */}
        {currentItems.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="font-poppins text-gray-600 text-lg">No items found in this category.</p>
          </motion.div>
        )}

        {/* Order Online CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="font-fredericka text-3xl text-gray-800 mb-4">
              Ready to Order?
            </h3>
            <p className="font-poppins text-gray-600 mb-6">
              Add items to your cart and choose between collection or delivery.
              We accept card payments for a smooth ordering experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="glass rounded-lg px-4 py-2 text-sm font-poppins text-gray-700">
                Collection Available
              </div>
              <div className="glass rounded-lg px-4 py-2 text-sm font-poppins text-gray-700">
                Local Delivery Available
              </div>
              <div className="glass rounded-lg px-4 py-2 text-sm font-poppins text-gray-700">
                Secure Card Payment
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default MenuSection