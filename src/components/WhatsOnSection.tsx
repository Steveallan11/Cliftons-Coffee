import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Tag, ArrowRight } from 'lucide-react'
import { publicContentService, Event, BlogPost } from '@/utils/contentManagementService'
import { Link } from 'react-router-dom'

interface WhatsOnSectionProps {
  className?: string
}

const WhatsOnSection: React.FC<WhatsOnSectionProps> = ({ className = '' }) => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'events' | 'blog'>('events')

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const result = await publicContentService.getPublicContent('all', {
        limit: 6,
        published_only: true
      })

      if (result.success && result.data) {
        setUpcomingEvents(result.data.upcoming_events || [])
        setRecentPosts(result.data.recent_posts || [])
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
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

  if (loading) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#9CAF88] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-fredericka text-[#5D4E37] mb-4">
              What's On at Clifton's
            </h2>
            <p className="font-poppins text-lg text-gray-600 max-w-2xl mx-auto">
              Stay up-to-date with our latest events, workshops, and news
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-full font-poppins font-medium transition-all duration-300 ${
                activeTab === 'events'
                  ? 'bg-[#9CAF88] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#9CAF88]'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-6 py-3 rounded-full font-poppins font-medium transition-all duration-300 ${
                activeTab === 'blog'
                  ? 'bg-[#9CAF88] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#9CAF88]'
              }`}
            >
              Latest News
            </button>
          </div>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
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
                    <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-2 text-center">
                      <div className="text-2xl font-bold text-[#5D4E37]">
                        {formatDate(event.event_date).split(' ')[0]}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(event.event_date).split(' ')[1]}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 font-poppins">
                      {event.title}
                    </h3>
                    
                    {event.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2 font-poppins">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      {(event.start_time || event.end_time) && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-[#9CAF88]" />
                          <span>
                            {event.start_time && formatTime(event.start_time)}
                            {event.start_time && event.end_time && ' - '}
                            {event.end_time && formatTime(event.end_time)}
                          </span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-[#9CAF88]" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={`/events/${event.slug}`}
                      className="inline-flex items-center text-[#9CAF88] hover:text-[#8A9B7A] font-medium transition-colors"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-poppins text-lg">No upcoming events at the moment</p>
                <p className="text-gray-400 font-poppins text-sm mt-2">Check back soon for exciting new events!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {recentPosts.length > 0 ? (
              recentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-[#9CAF88] to-[#8A9B7A] flex items-center justify-center">
                        <Tag className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 font-poppins">
                      {post.title}
                    </h3>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3 font-poppins">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{post.author_name}</span>
                      <span>{new Date(post.publish_date).toLocaleDateString('en-GB')}</span>
                      {post.reading_time && (
                        <span>{post.reading_time} min read</span>
                      )}
                    </div>
                    
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-[#9CAF88] hover:text-[#8A9B7A] font-medium transition-colors"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-poppins text-lg">No recent posts available</p>
                <p className="text-gray-400 font-poppins text-sm mt-2">We'll be sharing exciting news soon!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            to={activeTab === 'events' ? '/events' : '/blog'}
            className="inline-flex items-center px-8 py-3 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white font-poppins font-medium rounded-full transition-colors duration-300"
          >
            View All {activeTab === 'events' ? 'Events' : 'Posts'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default WhatsOnSection