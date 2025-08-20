import React from 'react'
import HeroSection from '@/components/sections/HeroSection'
import MenuSection from '@/components/sections/MenuSection'
import AboutSection from '@/components/sections/AboutSection'
import BookingSection from '@/components/sections/BookingSection'
import ContactSection from '@/components/sections/ContactSection'
import Footer from '@/components/Footer'

const HomePage = () => {
  return (
    <main className="pt-16">
      <HeroSection />
      <MenuSection />
      <AboutSection />
      <BookingSection />
      <ContactSection />
      <Footer />
    </main>
  )
}

export default HomePage