import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Tag, ArrowLeft, Filter, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { publicContentService, Event, EventCategory } from '@/utils/contentManagementService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const result = await publicContentService.getPublicContent('all', {
        published_only: true
      })

      if (result.success && result.data) {
        setEvents(result.data.events || [])
        setCategories(result.data.event_categories || [])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    const now = new Date()
    const eventDate = new Date(event.event_date)
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !selectedCategory || event.category_id?.toString() === selectedCategory
    const isUpcoming = eventDate >= now
    
    return matchesSearch && matchesCategory && (!showUpcomingOnly || isUpcoming)
  })

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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#9CAF88] to-[#8A9B7A] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-5xl font-fredericka mb-6">
              Events at Clifton's
            </h1>
            <p className="text-xl font-poppins opacity-90 max-w-2xl mx-auto">
              Join us for exciting events, workshops, and special occasions at our cozy coffee shop
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9CAF88] bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  showUpcomingOnly
                    ? 'bg-[#9CAF88] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Upcoming Only
              </button>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 text-gray-600">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => {
                const category = categories.find(c => c.id === event.category_id)
                const isUpcoming = isEventUpcoming(event.event_date)
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-[#9CAF88] to-[#8A9B7A] flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-white" />
                        </div>
                      )}
                      
                      {/* Date Badge */}
                      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-2 text-center shadow-md">
                        <div className="text-2xl font-bold text-[#5D4E37]">
                          {new Date(event.event_date).getDate()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(event.event_date).toLocaleDateString('en-GB', { month: 'short' })}
                        </div>
                      </div>
                      
                      {/* Category Badge */}
                      {category && (
                        <div className="absolute top-4 right-4">
                          <span 
                            className="px-3 py-1 rounded-full text-sm font-medium text-white shadow-md"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        </div>
                      )}
                      
                      {/* Past Event Indicator */}
                      {!isUpcoming && (
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm font-medium">
                            Past Event
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3 font-poppins line-clamp-2">
                        {event.title}
                      </h3>
                      
                      {event.description && (
                        <p className="text-gray-600 mb-4 line-clamp-3 font-poppins">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-3 text-[#9CAF88]" />
                          <span className="font-medium">{formatDate(event.event_date)}</span>
                        </div>
                        
                        {(event.start_time || event.end_time) && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-3 text-[#9CAF88]" />
                            <span>
                              {event.start_time && formatTime(event.start_time)}
                              {event.start_time && event.end_time && ' - '}
                              {event.end_time && formatTime(event.end_time)}
                            </span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-3 text-[#9CAF88]" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Ticket Info */}
                      <div className="flex items-center justify-between mb-4">
                        {event.ticket_price !== undefined && event.ticket_price > 0 ? (
                          <span className="text-lg font-semibold text-[#9CAF88]">
                            £{event.ticket_price.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-lg font-semibold text-green-600">
                            Free Event
                          </span>
                        )}
                        
                        {event.max_attendees && (
                          <span className="text-sm text-gray-500">
                            {event.current_attendees || 0}/{event.max_attendees} spots
                          </span>
                        )}
                      </div>
                      
                      <Link
                        to={`/events/${event.slug}`}
                        className={`block w-full text-center py-3 px-4 rounded-full font-medium transition-colors ${
                          isUpcoming
                            ? 'bg-[#9CAF88] hover:bg-[#8A9B7A] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isUpcoming ? 'View Details' : 'View Event'}
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Check back soon for exciting new events!'}
              </p>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default EventsPage