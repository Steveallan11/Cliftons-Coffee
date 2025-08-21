import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingCart, User, Phone, MapPin } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import CartDrawer from './CartDrawer'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { state } = useCart()
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#9CAF88] rounded-full flex items-center justify-center">
                <span className="font-fredericka text-xl text-white">C</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-fredericka text-2xl text-shadow">Clifton's Coffee Shop</h1>
                <p className="text-xs text-gray-300">Cogenhoe & Whiston Village Hall</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection('hero')}
                className="hover:text-[#FFD1A3] transition-colors duration-300"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('menu')}
                className="hover:text-[#FFD1A3] transition-colors duration-300"
              >
                Menu
              </button>
              <Link
                to="/events"
                className="hover:text-[#FFD1A3] transition-colors duration-300"
              >
                What's On
              </Link>
              <Link
                to="/blog"
                className="hover:text-[#FFD1A3] transition-colors duration-300"
              >
                News
              </Link>
              <button 
                onClick={() => scrollToSection('about')}
                className="hover:text-[#FFD1A3] transition-colors duration-300"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('booking')}
                className="hover:text-[#FFD1A3] transition-colors duration-300"
              >
                Book Table
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="hover:text-[#FFD1A3] transition-colors duration-300"
              >
                Contact
              </button>
              
              {/* Quick Contact */}
              <div className="flex items-center space-x-4 ml-4 border-l border-white/20 pl-4">
                <a 
                  href="https://wa.me/447123456789" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors"
                >
                  <Phone size={18} />
                </a>
                <a 
                  href="https://maps.google.com/?q=Cogenhoe+Whiston+Village+Hall+Northamptonshire" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#4285F4] transition-colors"
                >
                  <MapPin size={18} />
                </a>
              </div>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:text-[#FFD1A3] transition-colors duration-300"
              >
                <ShoppingCart size={24} />
                {state.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4A4A4] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {state.itemCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="px-3 py-1 text-sm bg-[#9CAF88] rounded-full hover:bg-[#9CAF88]/80 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button 
                    onClick={handleSignOut}
                    className="p-2 hover:text-[#FFD1A3] transition-colors duration-300"
                  >
                    <User size={20} />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/admin-login" 
                  className="p-2 hover:text-[#FFD1A3] transition-colors duration-300"
                >
                  <User size={20} />
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:text-[#FFD1A3] transition-colors duration-300"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              <button 
                onClick={() => scrollToSection('hero')}
                className="block w-full text-left py-2 hover:text-[#FFD1A3] transition-colors duration-300"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('menu')}
                className="block w-full text-left py-2 hover:text-[#FFD1A3] transition-colors duration-300"
              >
                Menu
              </button>
              <Link
                to="/events"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left py-2 hover:text-[#FFD1A3] transition-colors duration-300"
              >
                What's On
              </Link>
              <Link
                to="/blog"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left py-2 hover:text-[#FFD1A3] transition-colors duration-300"
              >
                News
              </Link>
              <button 
                onClick={() => scrollToSection('about')}
                className="block w-full text-left py-2 hover:text-[#FFD1A3] transition-colors duration-300"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('booking')}
                className="block w-full text-left py-2 hover:text-[#FFD1A3] transition-colors duration-300"
              >
                Book Table
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left py-2 hover:text-[#FFD1A3] transition-colors duration-300"
              >
                Contact
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Header