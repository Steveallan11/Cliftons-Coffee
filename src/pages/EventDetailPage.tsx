import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, DollarSign, ArrowLeft, Share2, Tag } from 'lucide-react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { publicContentService, Event, EventCategory } from '@/utils/contentManagementService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TicketPurchaseModal from '@/components/TicketPurchaseModal'
import toast from 'react-hot-toast'

const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [category, setCategory] = useState<EventCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (slug) {
      loadEvent()
    }
  }, [slug])

  const loadEvent = async () => {
    try {
      setLoading(true)
      setNotFound(false)
      
      // Get all events and find the one with matching slug
      const result = await publicContentService.getPublicContent('all', {
        published_only: true
      })

      if (result.success && result.data) {
        const events = result.data.events || []
        const categories = result.data.event_categories || []
        const foundEvent = events.find((e: Event) => e.slug === slug)
        
        if (foundEvent) {
          setEvent(foundEvent)
          if (foundEvent.category_id) {
            const eventCategory = categories.find((c: EventCategory) => c.id === foundEvent.category_id)
            setCategory(eventCategory || null)
          }
        } else {
          setNotFound(true)
        }
      }
    } catch (error) {
      console.error('Error loading event:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    return new Date(2000, 0, 1, parseInt(hours), parseInt(minutes)).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isEventUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date()
  }

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to clipboard
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const handleTicketSuccess = (confirmationData: any) => {
    toast.success(`Tickets booked! Confirmation: ${confirmationData.confirmationNumber}`)
    // Optionally reload event data to update attendee count
    loadEvent()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#9CAF88] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-fredericka text-gray-800 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/events"
            className="inline-flex items-center px-6 py-3 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white font-medium rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const isUpcoming = isEventUpcoming(event.event_date)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="relative h-96 overflow-hidden">
          {event.image_url ? (
            <>
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#9CAF88] to-[#8A9B7A]" />
          )}
          
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <button
                  onClick={() => navigate('/events')}
                  className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Events
                </button>
                
                <div className="flex items-center space-x-4 mb-4">
                  {category && (
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium text-white shadow-md"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </span>
                  )}
                  
                  {!isUpcoming && (
                    <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm font-medium">
                      Past Event
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-fredericka text-white mb-4">
                  {event.title}
                </h1>
                
                <div className="flex items-center space-x-6 text-white/90">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="font-medium">{formatDate(event.event_date)}</span>
                  </div>
                  
                  {(event.start_time || event.end_time) && (
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>
                        {event.start_time && formatTime(event.start_time)}
                        {event.start_time && event.end_time && ' - '}
                        {event.end_time && formatTime(event.end_time)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {event.description && (
                  <div className="prose prose-lg max-w-none mb-8">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {event.description}
                    </div>
                  </div>
                )}
                
                {/* Event Details Grid */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-fredericka text-gray-800 mb-6">Event Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-[#9CAF88] mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Date</h4>
                        <p className="text-gray-600">{formatDate(event.event_date)}</p>
                      </div>
                    </div>
                    
                    {(event.start_time || event.end_time) && (
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-[#9CAF88] mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Time</h4>
                          <p className="text-gray-600">
                            {event.start_time && formatTime(event.start_time)}
                            {event.start_time && event.end_time && ' - '}
                            {event.end_time && formatTime(event.end_time)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-[#9CAF88] mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Location</h4>
                          <p className="text-gray-600">{event.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {event.max_attendees && (
                      <div className="flex items-start space-x-3">
                        <Users className="w-5 h-5 text-[#9CAF88] mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Capacity</h4>
                          <p className="text-gray-600">
                            {event.current_attendees || 0} / {event.max_attendees} attendees
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-3">
                      <DollarSign className="w-5 h-5 text-[#9CAF88] mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Price</h4>
                        <p className="text-gray-600">
                          {event.ticket_price && event.ticket_price > 0 
                            ? `£${event.ticket_price.toFixed(2)}` 
                            : 'Free Event'}
                        </p>
                      </div>
                    </div>
                    
                    {category && (
                      <div className="flex items-start space-x-3">
                        <Tag className="w-5 h-5 text-[#9CAF88] mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Category</h4>
                          <p className="text-gray-600">{category.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-8 space-y-6"
              >
                {/* Booking/Info Card */}
                <div className="bg-white border-2 border-[#9CAF88] rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-[#9CAF88] mb-2">
                      {event.ticket_price && event.ticket_price > 0 
                        ? `£${event.ticket_price.toFixed(2)}` 
                        : 'Free'}
                    </div>
                    <p className="text-gray-600">per person</p>
                  </div>
                  
                  {isUpcoming ? (
                    <div className="space-y-4">
                      {event.max_attendees && event.current_attendees && event.current_attendees >= event.max_attendees ? (
                        <div className="text-center py-4 bg-red-50 text-red-600 rounded-lg">
                          <p className="font-medium">Event Full</p>
                          <p className="text-sm">This event has reached capacity</p>
                        </div>
                      ) : event.ticket_price && event.ticket_price > 0 ? (
                        <button 
                          onClick={() => setShowTicketModal(true)}
                          className="w-full bg-[#9CAF88] hover:bg-[#8A9B7A] text-white font-medium py-4 rounded-full transition-colors"
                        >
                          Buy Tickets
                        </button>
                      ) : (
                        <div className="text-center py-4 bg-green-50 text-green-600 rounded-lg">
                          <p className="font-medium">Free Event</p>
                          <p className="text-sm">Just show up! No tickets required</p>
                        </div>
                      )}
                      
                      <button
                        onClick={handleShare}
                        className="w-full flex items-center justify-center space-x-2 border border-gray-300 hover:border-[#9CAF88] text-gray-700 hover:text-[#9CAF88] py-3 rounded-full transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Share Event</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 text-gray-600 rounded-lg">
                      <p className="font-medium">Event Completed</p>
                      <p className="text-sm">This event has already taken place</p>
                    </div>
                  )}
                </div>
                
                {/* Quick Info */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Quick Info</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium text-gray-800">
                        {event.start_time && event.end_time ? (
                          (() => {
                            const start = new Date(`2000-01-01 ${event.start_time}`)
                            const end = new Date(`2000-01-01 ${event.end_time}`)
                            const diffMs = end.getTime() - start.getTime()
                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                            return diffHours > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffMinutes}m`
                          })()
                        ) : 'TBD'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language</span>
                      <span className="font-medium text-gray-800">English</span>
                    </div>
                    
                    {event.max_attendees && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spots Available</span>
                        <span className="font-medium text-gray-800">
                          {Math.max(0, event.max_attendees - (event.current_attendees || 0))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Need Help?</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Have questions about this event? We're here to help!
                  </p>
                  <Link
                    to="/#contact"
                    className="block w-full text-center border border-[#9CAF88] text-[#9CAF88] hover:bg-[#9CAF88] hover:text-white py-3 rounded-full transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      
      {/* Ticket Purchase Modal */}
      {event && (
        <TicketPurchaseModal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          event={event}
          onSuccess={handleTicketSuccess}
        />
      )}
    </div>
  )
}

export default EventDetailPage