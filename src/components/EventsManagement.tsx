import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Users, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  X, 
  Save,
  Tag,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  eventsManagementService, 
  contentImageService, 
  Event, 
  EventCategory 
} from '@/utils/contentManagementService'

interface EventsManagementProps {
  darkMode?: boolean
}

const EventsManagement: React.FC<EventsManagementProps> = ({ darkMode = false }) => {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    image_url: '',
    category_id: undefined,
    is_published: false,
    max_attendees: undefined,
    ticket_price: 0
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    color: '#9CAF88',
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventsResult, categoriesResult] = await Promise.all([
        eventsManagementService.getEvents(),
        eventsManagementService.getEventCategories()
      ])

      if (eventsResult.success && eventsResult.data) {
        setEvents(eventsResult.data)
      } else {
        toast.error(eventsResult.error || 'Failed to load events')
      }

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data)
      } else {
        toast.error(categoriesResult.error || 'Failed to load categories')
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error('Failed to load events data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File, eventId?: number) => {
    try {
      setUploading(true)
      const result = await contentImageService.uploadImage(file, 'event', eventId)
      
      if (result.success && result.data) {
        return result.data.publicUrl
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.event_date) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      let imageUrl = formData.image_url
      
      // Upload image if a new file is selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile)
        if (!imageUrl) return
      }

      const eventData = {
        ...formData,
        image_url: imageUrl,
        ticket_price: formData.ticket_price ? Number(formData.ticket_price) : 0,
        max_attendees: formData.max_attendees ? Number(formData.max_attendees) : undefined
      } as Event

      if (editingEvent) {
        const result = await eventsManagementService.updateEvent(editingEvent.id!, eventData)
        if (result.success) {
          toast.success('Event updated successfully')
          setEditingEvent(null)
        } else {
          toast.error(result.error || 'Failed to update event')
          return
        }
      } else {
        const result = await eventsManagementService.createEvent(eventData)
        if (result.success) {
          toast.success('Event created successfully')
          setShowAddForm(false)
        } else {
          toast.error(result.error || 'Failed to create event')
          return
        }
      }

      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error('Failed to save event')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const result = await eventsManagementService.deleteEvent(id)
      if (result.success) {
        toast.success('Event deleted successfully')
        loadData()
      } else {
        toast.error(result.error || 'Failed to delete event')
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Failed to delete event')
    }
  }

  const handleTogglePublished = async (id: number, currentStatus: boolean) => {
    try {
      const result = await eventsManagementService.updateEvent(id, {
        is_published: !currentStatus
      })
      
      if (result.success) {
        toast.success(`Event ${!currentStatus ? 'published' : 'unpublished'} successfully`)
        loadData()
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error: any) {
      console.error('Toggle status error:', error)
      toast.error('Failed to update status')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await eventsManagementService.createEventCategory(categoryFormData)
      if (result.success) {
        toast.success('Category created successfully')
        setCategoryFormData({ name: '', description: '', color: '#9CAF88', is_active: true })
        setShowCategoryModal(false)
        loadData()
      } else {
        toast.error(result.error || 'Failed to create category')
      }
    } catch (error: any) {
      console.error('Create category error:', error)
      toast.error('Failed to create category')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      location: '',
      image_url: '',
      category_id: undefined,
      is_published: false,
      max_attendees: undefined,
      ticket_price: 0
    })
    setImageFile(null)
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !filterCategory || event.category_id?.toString() === filterCategory
    const matchesStatus = !filterStatus || 
      (filterStatus === 'published' ? event.is_published : !event.is_published)
    return matchesSearch && matchesCategory && matchesStatus
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#9CAF88] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`p-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-fredericka mb-2">Events Management</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage coffee shop events, workshops, and special occasions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Categories
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#9CAF88] hover:bg-[#8A9B7A] text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl p-4 mb-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
          >
            <option value="">All Events</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const category = categories.find(c => c.id === event.category_id)
          const isUpcoming = new Date(event.event_date) >= new Date()
          
          return (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden hover:shadow-md transition-shadow`}
            >
              <div className="relative">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling!.setAttribute('style', 'display: flex')
                    }}
                  />
                ) : null}
                <div className={`w-full h-48 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} flex items-center justify-center ${event.image_url ? 'hidden' : ''}`}>
                  <ImageIcon className={`w-12 h-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                
                <div className="absolute top-3 left-3">
                  {category && (
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </span>
                  )}
                </div>
                
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={() => handleTogglePublished(event.id!, event.is_published)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      event.is_published
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    {event.is_published ? 'Published' : 'Draft'}
                  </button>
                </div>
                
                {!isUpcoming && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                      Past Event
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {event.title}
                </h3>
                
                {event.description && (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2`}>
                    {event.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <CalendarIcon className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {formatDate(event.event_date)}
                    </span>
                  </div>
                  
                  {(event.start_time || event.end_time) && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {event.start_time && formatTime(event.start_time)}
                        {event.start_time && event.end_time && ' - '}
                        {event.end_time && formatTime(event.end_time)}
                      </span>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                        {event.location}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    {event.max_attendees && (
                      <div className="flex items-center space-x-1">
                        <Users className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {event.current_attendees || 0}/{event.max_attendees}
                        </span>
                      </div>
                    )}
                    
                    {event.ticket_price !== undefined && event.ticket_price > 0 && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          £{event.ticket_price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingEvent(event)
                      setFormData(event)
                      setShowAddForm(true)
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id!)}
                    className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Add/Edit Event Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && (() => {
              setShowAddForm(false)
              setEditingEvent(null)
              resetForm()
            })()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingEvent(null)
                    resetForm()
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={formData.event_date || ''}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </label>
                    <select
                      value={formData.category_id || ''}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : undefined })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.start_time || ''}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.end_time || ''}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                    } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                    } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Max Attendees
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_attendees || ''}
                      onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value ? Number(e.target.value) : undefined })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ticket Price (£)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.ticket_price || 0}
                      onChange={(e) => setFormData({ ...formData, ticket_price: Number(e.target.value) })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Event Image
                  </label>
                  <div className="space-y-3">
                    {(formData.image_url || imageFile) && (
                      <div className="relative inline-block">
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image_url: '' })
                            setImageFile(null)
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setImageFile(file)
                          }
                        }}
                        className="hidden"
                        id="event-image-upload"
                      />
                      <label
                        htmlFor="event-image-upload"
                        className={`px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                          darkMode
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Upload Image
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded border-gray-300 text-[#9CAF88] focus:ring-[#9CAF88]"
                  />
                  <label 
                    htmlFor="is-published"
                    className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Publish event immediately
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingEvent(null)
                      resetForm()
                    }}
                    className={`px-6 py-2 rounded-lg border transition-colors ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingEvent ? 'Update Event' : 'Create Event'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Management Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-xl p-6 max-w-md w-full`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Event Categories
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Existing Categories */}
              <div className="mb-6">
                <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Existing Categories
                </h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {category.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Add New Category
                </h4>
                
                <div>
                  <input
                    type="text"
                    placeholder="Category name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Description (optional)"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#9CAF88]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Color
                  </label>
                  <input
                    type="color"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    className="w-full h-10 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9CAF88]"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFormData({ name: '', description: '', color: '#9CAF88', is_active: true })
                      setShowCategoryModal(false)
                    }}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#9CAF88] hover:bg-[#8A9B7A] text-white rounded-lg transition-colors"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EventsManagement